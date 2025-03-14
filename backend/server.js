const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "atelierCRM",
  password: "postgres",
  port: 5432,
});

// Получить всех клиентов
app.get("/clients", async (req, res) => {
  try {
    console.log("Запрос клиентов:", new Date().toISOString());
    const { rows } = await pool.query("SELECT * FROM clients");
    console.log("Возвращено клиентов:", rows.length);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Получить все должности
app.get("/job-positions", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM job_positions"); // Исправлено
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Добавить новую должность
app.post("/job-positions", async (req, res) => {
  const { position_name } = req.body;

  if (!position_name) {
    return res.status(400).json({ error: "Position name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO job_positions (position_name) VALUES ($1) RETURNING *",
      [position_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Удалить должность
app.delete("/job-positions/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await pool.query("DELETE FROM job_positions WHERE job_position_id = $1", [
      id,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
