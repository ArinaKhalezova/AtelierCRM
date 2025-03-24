const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Получение всех сотрудников
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.employee_id, u.fullname, u.phone_number, u.email, e.position 
      FROM employees e
      JOIN users u ON e.user_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение списка должностей
router.get("/job-positions", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT unnest(enum_range(NULL::job_position)) AS position"
    );
    res.json(rows.map((row) => row.position));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление сотрудника
router.post("/", async (req, res) => {
  const { fullname, phone_number, email, password, position } = req.body;

  if (!fullname || !phone_number || !password || !position) {
    return res
      .status(400)
      .json({ error: "Обязательные поля: ФИО, телефон, пароль и должность" });
  }

  try {
    await pool.query("BEGIN");

    // Создание пользователя
    const userResult = await pool.query(
      "INSERT INTO users (fullname, phone_number, email, password_hash, role) VALUES ($1, $2, $3, $4, 'Работник') RETURNING user_id",
      [fullname, phone_number, email, password]
    );

    const userId = userResult.rows[0].user_id;

    // Создание сотрудника
    const employeeResult = await pool.query(
      "INSERT INTO employees (user_id, position) VALUES ($1, $2) RETURNING *",
      [userId, position]
    );

    await pool.query("COMMIT");
    res.status(201).json(employeeResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
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
