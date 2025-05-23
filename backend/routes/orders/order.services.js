const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authenticate = require("../../middleware/auth");

// Получение услуг заказа
router.get("/:id/services", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT os.*, s.name as service_name, s.base_cost 
       FROM order_services os
       JOIN services s ON os.service_id = s.service_id
       WHERE os.order_id = $1`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Добавление услуги к заказу
router.post("/:id/services", async (req, res) => {
  try {
    const { service_id, quantity } = req.body;
    if (!service_id || !quantity) {
      return res
        .status(400)
        .json({ error: "Необходимы service_id и quantity" });
    }

    const { rows } = await pool.query(
      `INSERT INTO order_services 
       (order_id, service_id, quantity) 
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, service_id, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Ошибка при добавлении услуги", details: err.message });
  }
});

router.put("/:orderId/services/:serviceId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const { rows } = await pool.query(
      `UPDATE order_services 
       SET quantity = $1
       WHERE order_service_id = $2
       RETURNING *`,
      [quantity, req.params.serviceId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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

module.exports = router;
