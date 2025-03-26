const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// Получение количества заказов по статусам
router.get("/status-counts", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error in GET /orders/status-counts:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

module.exports = router;
