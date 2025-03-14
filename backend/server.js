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

// Методы для должностей
app.get("/job-positions", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM job_positions");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

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

// Методы для статусов заказа
app.get("/statuses", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM statuses");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/statuses", async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO statuses (status) VALUES ($1) RETURNING *",
      [status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/statuses/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await pool.query("DELETE FROM statuses WHERE status_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Методы для типов материала
app.get("/material-types", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM material_types");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/material-types", async (req, res) => {
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: "Material type name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO material_types (type_name) VALUES ($1) RETURNING *",
      [type_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/material-types/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await pool.query(
      "DELETE FROM material_types WHERE  material_type_id = $1",
      [id]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
