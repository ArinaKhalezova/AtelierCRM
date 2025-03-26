const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const { v4: uuidv4 } = require("uuid");

// Получение всех заказов
router.get("/", async (req, res) => {
  try {
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
    console.error("Error in GET /orders:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Получение деталей заказа
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.fullname as client_name 
       FROM orders o
       JOIN clients c ON o.client_id = c.client_id
       WHERE o.order_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Order not found" });
    res.json(rows[0]);
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
    return res.status(400).json({ error: "Необходимы client_id и total_cost" });
  }

  try {
    const tracking_number = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO orders 
       (client_id, tracking_number, fitting_date, deadline_date, comment, total_cost) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
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
    res
      .status(500)
      .json({ error: "Ошибка при создании заказа", details: err.message });
  }
});

// Удаление заказа
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Проверяем существование заказа
    const orderCheck = await client.query(
      "SELECT status FROM orders WHERE order_id = $1 FOR UPDATE",
      [req.params.id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    // 2. Проверяем статус заказа (нельзя удалять выполненные/в работе)
    const orderStatus = orderCheck.rows[0].status;
    if (["В работе", "Выполнен"].includes(orderStatus)) {
      return res.status(400).json({
        error: "Нельзя удалить заказ в статусе " + orderStatus,
      });
    }

    // 3. Удаляем связанные материалы
    await client.query("DELETE FROM order_materials WHERE order_id = $1", [
      req.params.id,
    ]);

    // 4. Удаляем связанные услуги
    await client.query("DELETE FROM order_services WHERE order_id = $1", [
      req.params.id,
    ]);

    // 5. Удаляем сам заказ
    await client.query("DELETE FROM orders WHERE order_id = $1", [
      req.params.id,
    ]);

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting order:", err);
    res.status(500).json({
      error: "Ошибка при удалении заказа",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
