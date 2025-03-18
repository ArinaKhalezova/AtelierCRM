const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Получение всех накладных
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.*, s.org_name AS supplier_name
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.supplier_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление накладной
router.post("/", async (req, res) => {
  const { supplier_id, delivery_date, party } = req.body;

  if (!supplier_id || !delivery_date || !party) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO invoices (supplier_id, delivery_date, party) VALUES ($1, $2, $3) RETURNING *",
      [supplier_id, delivery_date, party]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление накладной
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID накладной обязателен" });
  }

  try {
    await pool.query("DELETE FROM invoices WHERE invoice_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
