const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM payment_methods");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { method_name } = req.body;

  if (!method_name) {
    return res.status(400).json({ error: "Payment method name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO payment_methods (method_name) VALUES ($1) RETURNING *",
      [method_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await pool.query(
      "DELETE FROM payment_methods WHERE payment_method_id = $1",
      [id]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
