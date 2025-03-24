const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// получение всех клиентов
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM clients");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// создание клиента
router.post("/", async (req, res) => {
  const { fullname, phone_number, email } = req.body;

  if (!fullname || !phone_number) {
    return res.status(400).json({ error: "Обязательные поля: ФИО и телефон" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO clients (fullname, phone_number, email) VALUES ($1, $2, $3) RETURNING *",
      [fullname, phone_number, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// удаление клиета
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM clients WHERE client_id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
