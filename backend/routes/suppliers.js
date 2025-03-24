const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Получение всех поставщиков
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM suppliers");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление поставщика
router.post("/", async (req, res) => {
  const { org_name, phone_number, address, inn } = req.body;

  if (!org_name || !phone_number || !address || !inn) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO suppliers (org_name, phone_number, address, inn) VALUES ($1, $2, $3, $4) RETURNING *",
      [org_name, phone_number, address, inn]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление поставщика
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Проверяем существование связанных поставок
    const deliveries = await pool.query(
      "SELECT * FROM deliveries WHERE supplier_id = $1",
      [id]
    );
    
    if (deliveries.rows.length > 0) {
      return res.status(400).json({
        error: "Невозможно удалить поставщика с существующими поставками",
      });
    }

    await pool.query("DELETE FROM suppliers WHERE supplier_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Ошибка при удалении поставщика",
    });
  }
});
module.exports = router;
