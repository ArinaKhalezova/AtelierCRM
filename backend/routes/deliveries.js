const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const validate = require("../validation");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Валидация данных поставки
function validateDeliveryData(data) {
  const errors = {};

  // Валидация номера поставки
  if (!data.delivery_number)
    errors.delivery_number = "Номер поставки обязателен";

  // Валидация поставщика
  if (!data.supplier_id) errors.supplier_id = "Необходимо указать поставщика";

  // Валидация даты
  const dateError = validate.date(data.delivery_date);
  if (dateError) errors.delivery_date = dateError;

  // Валидация материалов
  const materialsError = validate.materials(data.materials);
  if (materialsError) errors.materials = materialsError;

  return Object.keys(errors).length > 0 ? errors : null;
}

// Вспомогательная функция для получения полной информации о поставке
async function getFullDelivery(deliveryId) {
  try {
    const deliveryQuery = await pool.query(
      `SELECT 
        d.delivery_id,
        d.delivery_number,
        d.delivery_date,
        d.document_path,
        s.supplier_id,
        s.org_name AS supplier_name
       FROM deliveries d
       JOIN suppliers s ON d.supplier_id = s.supplier_id
       WHERE d.delivery_id = $1`,
      [deliveryId]
    );

    if (deliveryQuery.rows.length === 0) {
      return null;
    }

    const delivery = deliveryQuery.rows[0];

    const materialsQuery = await pool.query(
      `SELECT 
        dm.delivery_material_id,
        dm.quantity,
        dm.cost_per_unit,
        m.material_id,
        m.material_name,
        m.type,
        m.unit
       FROM delivery_materials dm
       JOIN materials m ON dm.material_id = m.material_id
       WHERE dm.delivery_id = $1`,
      [deliveryId]
    );

    delivery.materials = materialsQuery.rows;
    return delivery;
  } catch (err) {
    console.error("Error in getFullDelivery:", err);
    throw err;
  }
}

// Получение всех поставок с материалами
router.get("/", async (req, res) => {
  try {
    const deliveriesQuery = await pool.query(
      `SELECT 
      d.delivery_id,
      d.delivery_number,
      d.delivery_date,
      d.document_name,
      d.document_data,
      s.supplier_id,
      s.org_name AS supplier_name
    FROM deliveries d
    LEFT JOIN suppliers s ON d.supplier_id = s.supplier_id
    ORDER BY d.delivery_date DESC`
    );

    const deliveries = await Promise.all(
      deliveriesQuery.rows.map(async (delivery) => {
        const materialsQuery = await pool.query(
          `SELECT 
            dm.delivery_material_id,
            dm.quantity,
            dm.cost_per_unit,
            m.material_id,
            m.material_name,
            m.type,
            m.unit
           FROM delivery_materials dm
           JOIN materials m ON dm.material_id = m.material_id
           WHERE dm.delivery_id = $1`,
          [delivery.delivery_id]
        );
        delivery.materials = materialsQuery.rows;
        return delivery;
      })
    );

    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({
      error: "Ошибка сервера при получении поставок",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Добавление новой поставки с материалами
router.post("/", async (req, res) => {
  const {
    supplier_id,
    delivery_date,
    delivery_number,
    document_path,
    materials,
  } = req.body;

  // Валидация
  if (
    !delivery_number ||
    !supplier_id ||
    !delivery_date ||
    !materials?.length
  ) {
    return res.status(400).json({
      error:
        "Необходимо указать номер поставки, поставщика, дату и хотя бы один материал",
    });
  }

  const validationErrors = validateDeliveryData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      error: "Ошибки валидации",
      details: validationErrors,
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Создаем поставку
    const deliveryResult = await client.query(
      `INSERT INTO deliveries 
     (supplier_id, delivery_date, delivery_number) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
      [supplier_id, delivery_date, delivery_number]
    );

    const deliveryId = deliveryResult.rows[0].delivery_id;

    // 2. Обрабатываем материалы
    for (const material of materials) {
      let materialId = material.material_id;

      // Если это новый материал (без material_id, но с material_name)
      if (!materialId && material.material_name) {
        // Создаем новый материал
        const newMaterial = await client.query(
          `INSERT INTO materials 
           (material_name, type, unit, quantity, cost_per_unit) 
           VALUES ($1, $2, $3, 0, $4) 
           RETURNING material_id`,
          [
            material.material_name,
            material.type,
            material.unit,
            material.cost_per_unit,
          ]
        );
        materialId = newMaterial.rows[0].material_id;
      }

      if (!materialId || !material.quantity || !material.cost_per_unit) {
        throw new Error("Не все обязательные поля материала заполнены");
      }

      // Добавляем материал в поставку
      await client.query(
        `INSERT INTO delivery_materials 
         (delivery_id, material_id, quantity, cost_per_unit) 
         VALUES ($1, $2, $3, $4)`,
        [deliveryId, materialId, material.quantity, material.cost_per_unit]
      );

      // Обновляем количество материала на складе
      await client.query(
        `UPDATE materials 
         SET quantity = quantity + $1 
         WHERE material_id = $2`,
        [material.quantity, materialId]
      );
    }

    await client.query("COMMIT");

    // Получаем полные данные о созданной поставке
    const fullDelivery = await getFullDelivery(deliveryId);
    res.status(201).json(fullDelivery);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating delivery:", err);
    res.status(500).json({
      error: "Ошибка сервера при создании поставки",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    client.release();
  }
});

router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    const originalName = Buffer.from(req.file.originalname, "latin1").toString(
      "utf8"
    );

    await pool.query(
      `UPDATE deliveries 
       SET document_name = $1, document_data = $2
       WHERE delivery_id = $3`,
      [originalName, req.file.buffer, req.body.delivery_id]
    );

    res.json({ success: true, filename: originalName });
  } catch (err) {
    console.error("Error uploading document:", err);
    res.status(500).json({ error: "Ошибка при загрузке документа" });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT document_name, document_data 
       FROM deliveries 
       WHERE delivery_id = $1`,
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].document_data) {
      return res.status(404).json({ error: "Документ не найден" });
    }

    const { document_name, document_data } = rows[0];

    const filename = encodeURIComponent(rows[0].document_name);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${filename}`
    );
    res.send(document_data);
  } catch (err) {
    console.error("Error downloading document:", err);
    res.status(500).json({ error: "Ошибка при скачивании документа" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { supplier_id, delivery_date, delivery_number, materials } = req.body;

  // Валидация
  if (
    !delivery_number ||
    !supplier_id ||
    !delivery_date ||
    !materials?.length
  ) {
    return res.status(400).json({
      error:
        "Необходимо указать номер поставки, поставщика, дату и хотя бы один материал",
    });
  }

  const validationErrors = validateDeliveryData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      error: "Ошибки валидации",
      details: validationErrors,
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Проверка существования поставки
    const deliveryExists = await client.query(
      "SELECT * FROM deliveries WHERE delivery_id = $1",
      [id]
    );

    if (!deliveryExists.rows.length) {
      return res.status(404).json({ error: "Поставка не найдена" });
    }

    // 2. Обновление основной информации о поставке
    await client.query(
      `UPDATE deliveries SET
        supplier_id = $1,
        delivery_date = $2,
        delivery_number = $3
      WHERE delivery_id = $4`,
      [supplier_id, delivery_date, delivery_number, id]
    );

    // 3. Получаем текущие материалы поставки
    const currentMaterials = await client.query(
      `SELECT * FROM delivery_materials WHERE delivery_id = $1`,
      [id]
    );

    // 4. Обработка изменений материалов
    const newMaterialIds = new Set();
    const oldMaterialIds = new Set(
      currentMaterials.rows.map((m) => m.material_id)
    );

    // Добавление/обновление материалов
    for (const material of materials) {
      let materialId = material.material_id;

      // Создание нового материала при необходимости
      if (!materialId && material.material_name) {
        const newMaterial = await client.query(
          `INSERT INTO materials 
           (material_name, type, unit, quantity, cost_per_unit) 
           VALUES ($1, $2, $3, 0, $4) 
           RETURNING material_id`,
          [
            material.material_name,
            material.type,
            material.unit,
            material.cost_per_unit,
          ]
        );
        materialId = newMaterial.rows[0].material_id;
      }

      // Проверка обязательных полей
      if (!materialId || !material.quantity || !material.cost_per_unit) {
        throw new Error("Не все обязательные поля материала заполнены");
      }

      newMaterialIds.add(materialId);

      // Обновление или добавление материала
      const existingMaterial = currentMaterials.rows.find(
        (m) => m.material_id === materialId
      );

      if (existingMaterial) {
        // Обновление существующего материала
        const quantityDiff = material.quantity - existingMaterial.quantity;

        await client.query(
          `UPDATE delivery_materials SET
            quantity = $1,
            cost_per_unit = $2
           WHERE delivery_material_id = $3`,
          [
            material.quantity,
            material.cost_per_unit,
            existingMaterial.delivery_material_id,
          ]
        );

        // Обновление количества на складе
        await client.query(
          `UPDATE materials SET
            quantity = quantity + $1
           WHERE material_id = $2`,
          [quantityDiff, materialId]
        );
      } else {
        // Добавление нового материала
        await client.query(
          `INSERT INTO delivery_materials 
           (delivery_id, material_id, quantity, cost_per_unit)
           VALUES ($1, $2, $3, $4)`,
          [id, materialId, material.quantity, material.cost_per_unit]
        );

        // Обновление количества на складе
        await client.query(
          `UPDATE materials SET
            quantity = quantity + $1
           WHERE material_id = $2`,
          [material.quantity, materialId]
        );
      }
    }

    // Удаление отсутствующих материалов
    for (const oldMaterial of currentMaterials.rows) {
      if (!newMaterialIds.has(oldMaterial.material_id)) {
        await client.query(
          `DELETE FROM delivery_materials 
           WHERE delivery_material_id = $1`,
          [oldMaterial.delivery_material_id]
        );

        // Возврат количества на складе
        await client.query(
          `UPDATE materials SET
            quantity = quantity - $1
           WHERE material_id = $2`,
          [oldMaterial.quantity, oldMaterial.material_id]
        );
      }
    }

    await client.query("COMMIT");

    // Получаем обновленные данные
    const fullDelivery = await getFullDelivery(id);
    res.json(fullDelivery);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления поставки:", err);
    res.status(500).json({
      error: "Ошибка сервера при обновлении поставки",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});

// Удаление поставки
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Получаем все материалы поставки
    const materialsQuery = await client.query(
      `SELECT material_id 
       FROM delivery_materials 
       WHERE delivery_id = $1`,
      [id]
    );

    // 2. Удаляем материалы поставки из связующей таблицы
    await client.query(
      `DELETE FROM delivery_materials 
       WHERE delivery_id = $1`,
      [id]
    );

    // 3. Удаляем сами материалы из таблицы materials
    for (const material of materialsQuery.rows) {
      await client.query(
        `DELETE FROM materials 
         WHERE material_id = $1`,
        [material.material_id]
      );
    }

    // 4. Удаляем саму поставку
    await client.query(
      `DELETE FROM deliveries 
       WHERE delivery_id = $1`,
      [id]
    );

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting delivery:", err);
    res.status(500).json({
      error: "Ошибка при удалении поставки",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
