const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authMiddleware = require("../../middleware/auth");

router.use(authMiddleware);

// Обновление статуса заказа
router.get("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `
      SELECT 
        h.*,
        u.fullname,
        e.position
      FROM order_status_history_order h
      JOIN users u ON h.changed_by = u.user_id
      LEFT JOIN employees e ON u.user_id = e.user_id
      WHERE h.order_id = $1
      ORDER BY h.changed_at DESC
    `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/services/history", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `
      SELECT 
        h.*,
        u.fullname,
        e.position,
        s.name AS service_name
      FROM order_status_history h
      JOIN order_services os ON h.order_service_id = os.order_service_id
      JOIN services s ON os.service_id = s.service_id
      JOIN users u ON h.changed_by = u.user_id
      LEFT JOIN employees e ON u.user_id = e.user_id
      WHERE os.order_id = $1
      ORDER BY h.changed_at DESC
    `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const userId = req.user.user_id;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const query = `
        WITH old AS (
          SELECT status AS old_status FROM orders WHERE order_id = $1
        ),
        updated AS (
          UPDATE orders SET status = $2 WHERE order_id = $1 RETURNING *
        )
        INSERT INTO order_status_history_order (order_id, old_status, new_status, changed_by)
        SELECT $1, old.old_status, $2, $3
        FROM old
        RETURNING *;
      `;

      const result = await client.query(query, [orderId, status, userId]);

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }

      await client.query("COMMIT");

      //возврат обновлённого заказа
      const {
        rows: [updatedOrder],
      } = await pool.query("SELECT * FROM orders WHERE order_id = $1", [
        orderId,
      ]);

      res.json(updatedOrder);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/services/:id/status", async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.body;
    const orderServiceId = parseInt(req.params.id);
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Требуется авторизация" });
    }

    await client.query("BEGIN");

    // 1. Проверяем существование услуги
    const serviceCheck = await client.query(
      "SELECT order_service_id, status FROM order_services WHERE order_service_id = $1",
      [orderServiceId]
    );

    if (serviceCheck.rowCount === 0) {
      return res.status(404).json({ error: "Услуга не найдена" });
    }

    // 2. Проверяем допустимость нового статуса
    const validStatuses = [
      "Новый",
      "Создание эскиза",
      "Изготовление выкройки",
      "На кройке",
      "На пошиве",
      "На примерке",
      "Доработка и отделка",
      "Исправляется",
      "Готов",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Недопустимый статус" });
    }

    // 3. Обновляем статус и сохраняем историю
    await client.query(
      `UPDATE order_services SET status = $1 
       WHERE order_service_id = $2`,
      [status, orderServiceId]
    );

    const historyResult = await client.query(
      `INSERT INTO order_status_history (
        order_service_id, order_id, 
        old_status, new_status, changed_by
      ) 
      SELECT $1, order_id, $2, $3, $4 
      FROM order_services 
      WHERE order_service_id = $1 
      RETURNING *`,
      [orderServiceId, serviceCheck.rows[0].status, status, userId]
    );

    await client.query("COMMIT");

    res.json({
      ...historyResult.rows[0],
      new_status: status,
      service_id: orderServiceId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка транзакции:", {
      message: err.message,
      stack: err.stack,
      query: err.query,
    });
    res.status(500).json({
      error: "Внутренняя ошибка сервера",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
