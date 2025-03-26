const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

/**
 * Получение мерок клиента по ID заказа
 * GET /orders/:id/measurements
 */
router.get("/:id/measurements", async (req, res) => {
  const client = await pool.connect();
  try {
    // 1. Получаем client_id из заказа
    const orderQuery = await client.query(
      "SELECT client_id FROM orders WHERE order_id = $1",
      [req.params.id]
    );

    if (orderQuery.rows.length === 0) {
      return res.status(404).json({
        error: "Заказ не найден",
        details: `Order with id ${req.params.id} not found`,
      });
    }

    const clientId = orderQuery.rows[0].client_id;

    // 2. Получаем мерки клиента
    const measurementsQuery = await client.query(
      "SELECT * FROM measurements WHERE client_id = $1",
      [clientId]
    );

    // Возвращаем null если мерок нет
    res.json(measurementsQuery.rows[0] || null);
  } catch (err) {
    console.error("Error fetching measurements:", {
      error: err.message,
      stack: err.stack,
      orderId: req.params.id,
    });
    res.status(500).json({
      error: "Ошибка при получении мерок",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

/**
 * Сохранение/обновление мерок клиента
 * POST /orders/:id/measurements
 */
router.post("/:id/measurements", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Получаем client_id из заказа
    const orderQuery = await client.query(
      "SELECT client_id FROM orders WHERE order_id = $1",
      [req.params.id]
    );

    if (orderQuery.rows.length === 0) {
      return res.status(404).json({
        error: "Заказ не найден",
        details: `Order with id ${req.params.id} not found`,
      });
    }

    const clientId = orderQuery.rows[0].client_id;
    const { size, chest_size, waist_size, hip_size, shoulders_width, height } =
      req.body;

    // 2. Проверяем существующие мерки
    const existingQuery = await client.query(
      "SELECT measurement_id FROM measurements WHERE client_id = $1",
      [clientId]
    );

    let result;
    if (existingQuery.rows.length > 0) {
      // Обновляем существующие мерки
      result = await client.query(
        `UPDATE measurements SET
         size = $1, chest_size = $2, waist_size = $3,
         hip_size = $4, shoulders_width = $5, height = $6,
         updated_at = NOW()
         WHERE client_id = $7 RETURNING *`,
        [
          size,
          chest_size,
          waist_size,
          hip_size,
          shoulders_width,
          height,
          clientId,
        ]
      );
    } else {
      // Создаем новые мерки
      result = await client.query(
        `INSERT INTO measurements 
         (client_id, size, chest_size, waist_size, 
          hip_size, shoulders_width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          clientId,
          size,
          chest_size,
          waist_size,
          hip_size,
          shoulders_width,
          height,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving measurements:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({
      error: "Ошибка сохранения мерок",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
