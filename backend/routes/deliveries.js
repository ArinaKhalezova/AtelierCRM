const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Получение всех поставок
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, i.invoice_number, m.type_name AS material_name
      FROM deliveries d
      JOIN invoices i ON d.invoice_id = i.invoice_id
      JOIN materials m ON d.material_id = m.material_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление поставки
router.post("/", async (req, res) => {
  const { invoice_id, material_id, quantity, cost } = req.body;

  if (!invoice_id || !material_id || !quantity || !cost) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO deliveries (invoice_id, material_id, quantity, cost) VALUES ($1, $2, $3, $4) RETURNING *",
      [invoice_id, material_id, quantity, cost]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление поставки
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID поставки обязателен" });
  }

  try {
    await pool.query("DELETE FROM deliveries WHERE delivery_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
