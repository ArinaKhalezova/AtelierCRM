const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// Получение количества заказов по статусам
router.get("/status-counts", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        status,
        COUNT(*)::integer AS count
      FROM orders
      GROUP BY status
      ORDER BY status
    `);

    const statuses = [
      "Новый",
      "Принят",
      "В работе",
      "Готов",
      "Выполнен",
      "Отменен",
    ];
    const result = statuses.reduce((acc, status) => {
      acc[status] = rows.find((r) => r.status === status)?.count || 0;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    console.error("Error fetching status counts:", err);
    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
});

module.exports = router;
