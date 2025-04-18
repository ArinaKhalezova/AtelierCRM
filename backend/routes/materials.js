const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Валидация данных материала
function validateMaterialData(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.material_name !== undefined) {
    if (!data.material_name || data.material_name.trim().length === 0) {
      errors.push("Название материала обязательно");
    }
  }

  if (!isUpdate || data.type !== undefined) {
    if (!data.type || data.type.trim().length === 0) {
      errors.push("Тип материала обязателен");
    }
  }

  if (!isUpdate || data.unit !== undefined) {
    if (!data.unit || data.unit.trim().length === 0) {
      errors.push("Единица измерения обязательна");
    }
  }

  if (!isUpdate || data.quantity !== undefined) {
    if (data.quantity === undefined || data.quantity === null) {
      errors.push("Количество обязательно");
    } else if (isNaN(data.quantity)) {
      errors.push("Количество должно быть числом");
    } else if (data.quantity < 0) {
      errors.push("Количество не может быть отрицательным");
    }
  }

  if (!isUpdate || data.cost_per_unit !== undefined) {
    if (data.cost_per_unit === undefined || data.cost_per_unit === null) {
      errors.push("Цена за единицу обязательна");
    } else if (isNaN(data.cost_per_unit)) {
      errors.push("Цена за единицу должна быть числом");
    } else if (data.cost_per_unit <= 0) {
      errors.push("Цена за единицу должна быть положительной");
    }
  }

  return errors;
}

// Проверка существования материала по имени
router.get("/check", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Параметр name обязателен" });
  }

  try {
    const result = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM materials WHERE LOWER(material_name) = LOWER($1))",
      [name.trim()]
    );
    res.json({ exists: result.rows[0].exists });
  } catch (err) {
    console.error("Ошибка проверки материала:", err);
    res.status(500).json({
      error: "Ошибка сервера при проверке материала",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Получение всех материалов
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        d.delivery_number,
        d.delivery_date,
        s.org_name AS supplier_name
      FROM materials m
      JOIN delivery_materials dm ON m.material_id = dm.material_id
      JOIN deliveries d ON dm.delivery_id = d.delivery_id
      JOIN suppliers s ON d.supplier_id = s.supplier_id
      ORDER BY m.material_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка получения материалов:", err);
    res.status(500).json({
      error: "Ошибка сервера при получении материалов",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Получение типов материалов (ENUM values)
router.get("/types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT unnest(enum_range(NULL::material_type)) AS type"
    );
    res.json(result.rows.map((r) => r.type));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера при получении типов" });
  }
});

// Получение единиц измерения (ENUM values)
router.get("/units", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT unnest(enum_range(NULL::material_unit)) AS unit"
    );
    res.json(result.rows.map((r) => r.unit));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Ошибка сервера при получении единиц измерения" });
  }
});

// Добавление нового материала
router.post("/", async (req, res) => {
  const { material_name, type, unit, quantity, cost_per_unit } = req.body;

  // Валидация
  const validationErrors = validateMaterialData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Проверка на дубликат
    const duplicateCheck = await client.query(
      "SELECT 1 FROM materials WHERE LOWER(material_name) = LOWER($1) LIMIT 1",
      [material_name.trim()]
    );

    if (duplicateCheck.rowCount > 0) {
      return res
        .status(409)
        .json({ error: "Материал с таким названием уже существует" });
    }

    // Создание материала
    const result = await client.query(
      `INSERT INTO materials 
       (material_name, type, unit, quantity, cost_per_unit) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [material_name.trim(), type, unit, quantity, cost_per_unit]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client
      .query("ROLLBACK")
      .catch((e) => console.error("Rollback error:", e));
    console.error("Ошибка добавления материала:", err);
    res.status(500).json({
      error: "Ошибка сервера при добавлении материала",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});

// Обновление материала
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { material_name, type, unit, quantity, cost_per_unit } = req.body;

  // Валидация
  const validationErrors = validateMaterialData(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Проверка существования материала
    const materialExists = await client.query(
      "SELECT 1 FROM materials WHERE material_id = $1 LIMIT 1",
      [id]
    );

    if (materialExists.rowCount === 0) {
      return res.status(404).json({ error: "Материал не найден" });
    }

    // Проверка на дубликат (если меняется название)
    if (material_name) {
      const duplicateCheck = await client.query(
        `SELECT 1 FROM materials 
         WHERE LOWER(material_name) = LOWER($1) AND material_id != $2 LIMIT 1`,
        [material_name.trim(), id]
      );

      if (duplicateCheck.rowCount > 0) {
        return res
          .status(409)
          .json({ error: "Материал с таким названием уже существует" });
      }
    }

    // Обновление материала
    const result = await client.query(
      `UPDATE materials 
       SET material_name = COALESCE($1, material_name),
           type = COALESCE($2, type),
           unit = COALESCE($3, unit),
           quantity = COALESCE($4, quantity),
           cost_per_unit = COALESCE($5, cost_per_unit)
       WHERE material_id = $6 
       RETURNING *`,
      [
        material_name ? material_name.trim() : null,
        type || null,
        unit || null,
        quantity !== undefined ? quantity : null,
        cost_per_unit !== undefined ? cost_per_unit : null,
        id,
      ]
    );

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client
      .query("ROLLBACK")
      .catch((e) => console.error("Rollback error:", e));
    console.error("Ошибка обновления материала:", err);
    res.status(500).json({
      error: "Ошибка сервера при обновлении материала",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});

// Удаление материала
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Проверка использования материала в поставках
    const deliveryCheck = await client.query(
      "SELECT 1 FROM delivery_materials WHERE material_id = $1 LIMIT 1",
      [id]
    );

    if (deliveryCheck.rowCount > 0) {
      return res.status(400).json({
        error:
          "Невозможно удалить материал, так как он используется в поставках",
      });
    }

    // Проверка использования в заказах
    const orderCheck = await client.query(
      "SELECT 1 FROM order_materials WHERE material_id = $1 LIMIT 1",
      [id]
    );

    if (orderCheck.rowCount > 0) {
      return res.status(400).json({
        error: "Невозможно удалить материал, так как он используется в заказах",
      });
    }

    // Удаление материала
    await client.query("DELETE FROM materials WHERE material_id = $1", [id]);

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка удаления материала:", err);
    res.status(500).json({
      error: "Ошибка сервера при удалении материала",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
