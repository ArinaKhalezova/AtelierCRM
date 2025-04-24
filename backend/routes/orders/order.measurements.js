const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authenticate = require("../../middleware/auth");

/**
 * Получение мерок клиента по ID заказа
 * GET /orders/:id/measurements
 */
router.get("/:id/measurements", authenticate, async (req, res) => {
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
    const { id: orderId } = req.params;
    const measurements = req.body;

    // 1. Получаем client_id из заказа
    const orderQuery = await client.query(
      "SELECT client_id FROM orders WHERE order_id = $1",
      [orderId]
    );

    if (orderQuery.rows.length === 0) {
      return res.status(404).json({
        error: "Заказ не найден",
        details: `Order with id ${orderId} not found`,
      });
    }

    const clientId = orderQuery.rows[0].client_id;

    // 2. Проверяем существующие мерки
    const existingMeasurements = await client.query(
      "SELECT * FROM measurements WHERE client_id = $1",
      [clientId]
    );

    // 3. Сохраняем или обновляем мерки
    let result;
    if (existingMeasurements.rows.length > 0) {
      // Обновляем существующие мерки
      result = await client.query(
        `UPDATE measurements SET
          size = $2,
          chest_size = $3,
          waist_size = $4,
          hip_size = $5,
          shoulders_width = $6,
          height = $7
         WHERE client_id = $1
         RETURNING *`,
        [
          clientId,
          measurements.size,
          measurements.chest_size,
          measurements.waist_size,
          measurements.hip_size,
          measurements.shoulders_width,
          measurements.height,
        ]
      );
    } else {
      // Создаем новые мерки
      result = await client.query(
        `INSERT INTO measurements 
         (client_id, size, chest_size, waist_size, hip_size, shoulders_width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          clientId,
          measurements.size,
          measurements.chest_size,
          measurements.waist_size,
          measurements.hip_size,
          measurements.shoulders_width,
          measurements.height,
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving measurements:", {
      error: err.message,
      stack: err.stack,
      orderId: req.params.id,
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
