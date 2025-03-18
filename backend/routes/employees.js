const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Получение всех сотрудников
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*, jp.position_name 
      FROM employees e
      JOIN job_positions jp ON e.job_position_id = jp.job_position_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление сотрудника
router.post("/", async (req, res) => {
  const { job_position_id, fullname, phone_number, email } = req.body;

  if (!job_position_id || !fullname || !phone_number) {
    return res
      .status(400)
      .json({ error: "Обязательные поля: должность, ФИО и телефон" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO employees (job_position_id, fullname, phone_number, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [job_position_id, fullname, phone_number, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление сотрудника
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID сотрудника обязателен" });
  }

  try {
    await pool.query("DELETE FROM employees WHERE employee_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
