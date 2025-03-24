const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM services ORDER BY service_id"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT unnest(enum_range(NULL::service_category)) AS category"
    );
    res.json(rows.map((row) => row.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/", async (req, res) => {
  const { category, name, description, base_cost } = req.body;

  // Добавляем более строгую валидацию
  if (!category || !name || !name.trim() || isNaN(base_cost)) {
    return res.status(400).json({
      error: "Заполните все обязательные поля корректно",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO services (category, name, description, base_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category, name.trim(), description, parseFloat(base_cost)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM services WHERE service_id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
