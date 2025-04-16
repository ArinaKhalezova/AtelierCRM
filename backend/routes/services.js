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

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { category, name, description, base_cost } = req.body;

  // Валидация
  if (!category || !name || !name.trim() || isNaN(base_cost)) {
    return res.status(400).json({
      error: "Заполните все обязательные поля корректно",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Проверка существования услуги
    const serviceExists = await client.query(
      "SELECT 1 FROM services WHERE service_id = $1",
      [id]
    );

    if (!serviceExists.rowCount) {
      return res.status(404).json({ error: "Услуга не найдена" });
    }

    // Обновление данных
    const { rows } = await client.query(
      `UPDATE services SET
        category = $1,
        name = $2,
        description = $3,
        base_cost = $4
       WHERE service_id = $5
       RETURNING *`,
      [category, name.trim(), description, parseFloat(base_cost), id]
    );

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления услуги:", err);
    res.status(500).json({
      error: "Ошибка сервера при обновлении услуги",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
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
