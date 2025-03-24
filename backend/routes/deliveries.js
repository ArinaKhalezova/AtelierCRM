const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Вспомогательная функция для получения полной информации о поставке
async function getFullDelivery(deliveryId) {
  try {
    const deliveryQuery = await pool.query(
      `SELECT 
        d.delivery_id,
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
        d.delivery_date,
        d.document_path,
        s.supplier_id,
        s.org_name AS supplier_name
       FROM deliveries d
       JOIN suppliers s ON d.supplier_id = s.supplier_id
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
  const { supplier_id, delivery_date, document_path, materials } = req.body;

  // Валидация
  if (!supplier_id || !delivery_date || !materials?.length) {
    return res.status(400).json({
      error: "Необходимо указать поставщика, дату и хотя бы один материал",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Создаем поставку
    const deliveryResult = await client.query(
      `INSERT INTO deliveries 
       (supplier_id, delivery_date, document_path) 
       VALUES ($1, $2, $3) 
       RETURNING delivery_id`,
      [supplier_id, delivery_date, document_path || null]
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
      details: err.message,
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
      `SELECT material_id, quantity 
       FROM delivery_materials 
       WHERE delivery_id = $1`,
      [id]
    );

    // 2. Удаляем материалы поставки
    await client.query(
      `DELETE FROM delivery_materials 
       WHERE delivery_id = $1`,
      [id]
    );

    // 3. Удаляем саму поставку
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
