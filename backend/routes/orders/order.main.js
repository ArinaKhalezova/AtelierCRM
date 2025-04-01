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
        o.created_at,
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Генерация tracking_number в транзакции
    const tracking_number = await generateDateBasedCode(client);

    const { rows } = await client.query(
      `INSERT INTO orders 
       (client_id, tracking_number, status, fitting_date, deadline_date, comment, total_cost, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [
        client_id,
        tracking_number,
        "Новый", // Добавляем статус по умолчанию
        fitting_date || null, // Разрешаем NULL для необязательных полей
        deadline_date,
        comment || null,
        total_cost,
      ]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.status(500).json({
      error: "Ошибка при создании заказа",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    client.release();
  }
});

// Обновленные функции генерации кода
async function generateDateBasedCode(client) {
  const now = new Date();
  const datePart =
    now.getDate().toString().padStart(2, "0") +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getFullYear().toString().slice(-2);

  const lastNumber = await getLastOrderNumberForToday(client, datePart);
  const seqPart = (lastNumber + 1).toString().padStart(3, "0");

  return `${datePart}-${seqPart}`;
}

async function getLastOrderNumberForToday(client, datePart) {
  const { rows } = await client.query(
    `SELECT tracking_number 
     FROM orders 
     WHERE tracking_number LIKE $1
     ORDER BY order_id DESC 
     LIMIT 1`,
    [`${datePart}-%`]
  );

  if (rows.length === 0) return 0;

  const lastNumber = parseInt(rows[0].tracking_number.split("-")[1]);
  return isNaN(lastNumber) ? 0 : lastNumber;
}

// Редактирование заказа
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fitting_date, deadline_date, comment } = req.body;

  // Валидация обязательных полей
  if (!deadline_date) {
    return res.status(400).json({ error: "Необходима дата завершения" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE orders 
       SET 
         fitting_date = $1,
         deadline_date = $2,
         comment = $3
       WHERE order_id = $4
       RETURNING *`,
      [fitting_date, deadline_date, comment, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({
      error: "Ошибка при обновлении заказа",
      details: err.message,
    });
  }
});

// Удаление заказа
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderCheck = await client.query(
      "SELECT status FROM orders WHERE order_id = $1 FOR UPDATE",
      [req.params.id]
    );

    if (orderCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "Заказ не найден",
      });
    }

    const orderStatus = orderCheck.rows[0].status;
    if (["В работе", "Выполнен"].includes(orderStatus)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: "Нельзя удалить заказ в статусе " + orderStatus,
      });
    }

    await client.query("DELETE FROM order_materials WHERE order_id = $1", [
      req.params.id,
    ]);
    await client.query("DELETE FROM order_services WHERE order_id = $1", [
      req.params.id,
    ]);
    await client.query("DELETE FROM orders WHERE order_id = $1", [
      req.params.id,
    ]);

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Заказ успешно удален",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting order:", err);
    res.status(500).json({
      success: false,
      error: "Ошибка при удалении заказа",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
