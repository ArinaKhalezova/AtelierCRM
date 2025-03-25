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

  // Базовая валидация
  if (!org_name || !phone_number || !address || !inn) {
    return res
      .status(400)
      .json({ error: "Все поля обязательны для заполнения" });
  }

  // Валидация ИНН
  if (!/^\d{10}$|^\d{12}$/.test(inn)) {
    return res
      .status(400)
      .json({ error: "ИНН должен содержать 10 или 12 цифр" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suppliers (org_name, phone_number, address, inn) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [org_name, phone_number, address, inn]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка добавления поставщика:", err);

    // Проверка на дубликат ИНН
    if (err.code === "23505" && err.constraint === "suppliers_inn_key") {
      return res
        .status(409)
        .json({ error: "Поставщик с таким ИНН уже существует" });
    }

    res.status(500).json({
      error: "Ошибка сервера при добавлении поставщика",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { org_name, phone_number, address, inn } = req.body;

  // Валидация
  if (!org_name || !phone_number || !address || !inn) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  if (!/^\d{10}$|^\d{12}$/.test(inn)) {
    return res
      .status(400)
      .json({ error: "ИНН должен содержать 10 или 12 цифр" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Проверка существования поставщика
    const supplierExists = await client.query(
      "SELECT 1 FROM suppliers WHERE supplier_id = $1",
      [id]
    );

    if (!supplierExists.rowCount) {
      return res.status(404).json({ error: "Поставщик не найден" });
    }

    // Проверка ИНН на дубликат (исключая текущего поставщика)
    const innExists = await client.query(
      "SELECT 1 FROM suppliers WHERE inn = $1 AND supplier_id != $2",
      [inn, id]
    );

    if (innExists.rowCount > 0) {
      return res
        .status(409)
        .json({ error: "Поставщик с таким ИНН уже существует" });
    }

    // Обновление данных
    const result = await client.query(
      `UPDATE suppliers SET 
        org_name = $1,
        phone_number = $2,
        address = $3,
        inn = $4
       WHERE supplier_id = $5
       RETURNING *`,
      [org_name, phone_number, address, inn, id]
    );

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления поставщика:", err);
    res.status(500).json({
      error: "Ошибка сервера при обновлении поставщика",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});

// Удаление поставщика
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Проверка существования поставщика
    const supplierExists = await client.query(
      "SELECT 1 FROM suppliers WHERE supplier_id = $1",
      [id]
    );

    if (!supplierExists.rowCount) {
      return res.status(404).json({ error: "Поставщик не найден" });
    }

    // 2. Проверка связанных поставок
    const hasDeliveries = await client.query(
      "SELECT 1 FROM deliveries WHERE supplier_id = $1 LIMIT 1",
      [id]
    );

    if (hasDeliveries.rowCount > 0) {
      return res.status(400).json({
        error: "Нельзя удалить поставщика с существующими поставками",
        details: "Сначала удалите все связанные поставки",
      });
    }

    // 3. Удаление поставщика
    await client.query("DELETE FROM suppliers WHERE supplier_id = $1", [id]);

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка удаления поставщика:", err);
    res.status(500).json({
      error: "Ошибка сервера при удалении поставщика",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});
module.exports = router;
