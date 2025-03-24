const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Получение всех заказов
router.get("/", async (req, res) => {
  try {
    // Проверка соединения с базой
    await pool.query("SELECT 1");

    // Основной запрос с правильными полями
    const { rows } = await pool.query(`
      SELECT 
        o.order_id,
        o.tracking_number,
        o.status,
        o.total_cost,
        o.fitting_date,
        o.deadline_date,
        o.comment,
        c.fullname as client_name,
        c.phone_number as client_phone
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.client_id
      ORDER BY o.order_id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error in GET /orders:", {
      message: err.message,
      stack: err.stack,
      query: err.query,
    });

    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
});

// Получение деталей заказа
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT o.*, c.fullname as client_name 
      FROM orders o
      JOIN clients c ON o.client_id = c.client_id
      WHERE o.order_id = $1
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Получение услуг заказа
router.get("/:id/services", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT os.*, s.name as service_name, s.base_cost 
      FROM order_services os
      JOIN services s ON os.service_id = s.service_id
      WHERE os.order_id = $1
    `,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Получение материалов заказа
router.get("/:id/materials", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT om.*, m.material_name, m.cost_per_unit, m.unit 
      FROM order_materials om
      JOIN materials m ON om.material_id = m.material_id
      WHERE om.order_id = $1
    `,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Создание заказа
router.post("/", async (req, res) => {
  const { client_id, fitting_date, deadline_date, comment, total_cost } =
    req.body;

  if (!client_id || !total_cost) {
    return res.status(400).json({
      error: "Необходимы client_id и total_cost",
    });
  }

  try {
    const tracking_number = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO orders 
       (client_id, tracking_number, fitting_date, deadline_date, comment, total_cost) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        client_id,
        tracking_number,
        fitting_date,
        deadline_date,
        comment,
        total_cost,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Ошибка при создании заказа",
      details: err.message,
    });
  }
});

// Добавление услуги к заказу
router.post("/:id/services", async (req, res) => {
  try {
    const { service_id, quantity } = req.body;

    if (!service_id || !quantity) {
      return res.status(400).json({
        error: "Необходимы service_id и quantity",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO order_services 
       (order_id, service_id, quantity) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.params.id, service_id, quantity]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Ошибка при добавлении услуги",
      details: err.message,
    });
  }
});

// Добавление материала к заказу
router.post("/:id/materials", async (req, res) => {
  const client = await pool.connect();
  try {
    const { material_id, quantity } = req.body;

    if (!material_id || !quantity) {
      return res.status(400).json({
        error: "Необходимы material_id и quantity",
      });
    }

    await client.query("BEGIN");

    // Проверка доступности материала
    const material = await client.query(
      `SELECT quantity FROM materials 
       WHERE material_id = $1 FOR UPDATE`,
      [material_id]
    );

    if (material.rows.length === 0) {
      throw new Error("Материал не найден");
    }

    if (material.rows[0].quantity < quantity) {
      throw new Error("Недостаточно материала на складе");
    }

    // Добавление материала в заказ
    const { rows } = await client.query(
      `INSERT INTO order_materials 
       (order_id, material_id, quantity) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.params.id, material_id, quantity]
    );

    // Обновление остатка на складе
    await client.query(
      `UPDATE materials 
       SET quantity = quantity - $1 
       WHERE material_id = $2`,
      [quantity, material_id]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: "Ошибка при добавлении материала",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

// Удаление услуги из заказа
router.delete("/:orderId/services/:serviceId", async (req, res) => {
  try {
    await pool.query("DELETE FROM order_services WHERE order_service_id = $1", [
      req.params.serviceId,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Удаление материала из заказа
router.delete("/:orderId/materials/:materialId", async (req, res) => {
  try {
    // Получаем количество материала для возврата на склад
    const { rows } = await pool.query(
      "SELECT material_id, quantity FROM order_materials WHERE order_material_id = $1",
      [req.params.materialId]
    );

    if (rows.length > 0) {
      // Возвращаем материал на склад
      await pool.query(
        "UPDATE materials SET quantity = quantity + $1 WHERE material_id = $2",
        [rows[0].quantity, rows[0].material_id]
      );
    }

    // Удаляем материал из заказа
    await pool.query(
      "DELETE FROM order_materials WHERE order_material_id = $1",
      [req.params.materialId]
    );

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Удаление заказа
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Удаляем связанные материалы (возвращаем на склад)
    const materials = await client.query(
      `SELECT material_id, quantity 
       FROM order_materials 
       WHERE order_id = $1`,
      [req.params.id]
    );

    for (const row of materials.rows) {
      await client.query(
        `UPDATE materials 
         SET quantity = quantity + $1 
         WHERE material_id = $2`,
        [row.quantity, row.material_id]
      );
    }

    // Удаляем связанные записи
    await client.query(
      `DELETE FROM order_services 
       WHERE order_id = $1`,
      [req.params.id]
    );

    await client.query(
      `DELETE FROM order_materials 
       WHERE order_id = $1`,
      [req.params.id]
    );

    // Удаляем сам заказ
    await client.query(
      `DELETE FROM orders 
       WHERE order_id = $1`,
      [req.params.id]
    );

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: "Ошибка при удалении заказа",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
