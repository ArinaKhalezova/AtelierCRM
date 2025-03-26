const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// Обновление статуса заказа
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Обновление статуса услуги в заказе
router.patch("/services/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE order_services SET status = $1 
       WHERE order_service_id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Order service not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating service status:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
