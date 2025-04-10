const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authenticate = require("../../middleware/auth");

// Получить все примерки для заказа
router.get("/:orderId/fittings", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM fittings WHERE order_id = $1 ORDER BY fitting_date",
      [req.params.orderId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching fittings:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Добавить новую примерку
router.post("/:orderId/fittings", authenticate, async (req, res) => {
  const { fitting_date, result, notes } = req.body;

  try {
    // Начинаем транзакцию
    await pool.query("BEGIN");

    // 1. Добавляем примерку в fittings
    const { rows } = await pool.query(
      `INSERT INTO fittings (order_id, fitting_date, result, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.orderId, fitting_date, result, notes]
    );

    // 2. Если это первая примерка - обновляем orders.fitting_date
    const fittingsCount = await pool.query(
      "SELECT COUNT(*) FROM fittings WHERE order_id = $1",
      [req.params.orderId]
    );

    if (fittingsCount.rows[0].count === "1") {
      await pool.query(
        "UPDATE orders SET fitting_date = $1 WHERE order_id = $2",
        [fitting_date, req.params.orderId]
      );
    }

    await pool.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error adding fitting:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Обновить примерку
router.put("/fittings/:id", authenticate, async (req, res) => {
  const { fitting_date, result, notes } = req.body;

  try {
    await pool.query("BEGIN");

    // 1. Получаем старые данные
    const oldFitting = await pool.query(
      "SELECT order_id, fitting_date FROM fittings WHERE fitting_id = $1",
      [req.params.id]
    );

    // 2. Обновляем примерку
    const { rows } = await pool.query(
      `UPDATE fittings 
       SET fitting_date = $1, result = $2, notes = $3, updated_at = NOW()
       WHERE fitting_id = $4 RETURNING *`,
      [fitting_date, result, notes, req.params.id]
    );

    if (rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Fitting not found" });
    }

    // 3. Проверяем, была ли это основная примерка
    const isMainFitting = await pool.query(
      "SELECT 1 FROM orders WHERE order_id = $1 AND fitting_date = $2",
      [oldFitting.rows[0].order_id, oldFitting.rows[0].fitting_date]
    );

    // 4. Если да или это единственная примерка - обновляем orders.fitting_date
    if (
      isMainFitting.rows.length > 0 ||
      fitting_date !== oldFitting.rows[0].fitting_date
    ) {
      const firstFitting = await pool.query(
        "SELECT fitting_date FROM fittings WHERE order_id = $1 ORDER BY fitting_date LIMIT 1",
        [oldFitting.rows[0].order_id]
      );

      await pool.query(
        "UPDATE orders SET fitting_date = $1 WHERE order_id = $2",
        [
          firstFitting.rows[0]?.fitting_date || null,
          oldFitting.rows[0].order_id,
        ]
      );
    }

    await pool.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error updating fitting:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Удалить примерку
router.delete("/fittings/:id", authenticate, async (req, res) => {
  try {
    await pool.query("BEGIN");

    // 1. Получаем данные о примерке перед удалением
    const fitting = await pool.query(
      "SELECT order_id, fitting_date FROM fittings WHERE fitting_id = $1",
      [req.params.id]
    );

    // 2. Удаляем примерку
    const { rowCount } = await pool.query(
      "DELETE FROM fittings WHERE fitting_id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Fitting not found" });
    }

    // 3. Проверяем, была ли это основная примерка
    const isMainFitting = await pool.query(
      "SELECT fitting_date FROM orders WHERE order_id = $1 AND fitting_date = $2",
      [fitting.rows[0].order_id, fitting.rows[0].fitting_date]
    );

    // 4. Если да - обновляем orders.fitting_date
    if (isMainFitting.rows.length > 0) {
      const nextFitting = await pool.query(
        "SELECT fitting_date FROM fittings WHERE order_id = $1 ORDER BY fitting_date LIMIT 1",
        [fitting.rows[0].order_id]
      );

      await pool.query(
        "UPDATE orders SET fitting_date = $1 WHERE order_id = $2",
        [nextFitting.rows[0]?.fitting_date || null, fitting.rows[0].order_id]
      );
    }

    await pool.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error deleting fitting:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
module.exports = router;
