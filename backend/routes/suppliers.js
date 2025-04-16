const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const validate = require("../validation");

// Валидация данных поставщика
function validateSupplierData(data) {
  const errors = {};

  // Валидация названия организации
  if (!data.org_name) {
    errors.org_name = "Название организации обязательно";
  } else if (data.org_name.length < 2) {
    errors.org_name = "Минимум 2 символа";
  } else if (data.org_name.length > 100) {
    errors.org_name = "Максимум 100 символов";
  }

  // Валидация телефона
  const phoneError = validate.phone(data.phone_number);
  if (phoneError) errors.phone_number = phoneError;

  // Валидация адреса
  if (!data.address) {
    errors.address = "Адрес обязателен";
  } else if (data.address.length < 5) {
    errors.address = "Минимум 5 символов";
  }

  // Валидация ИНН
  if (!data.inn) {
    errors.inn = "ИНН обязателен";
  } else if (!/^\d{10}$|^\d{12}$/.test(data.inn)) {
    errors.inn = "ИНН должен содержать 10 или 12 цифр";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

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

  // Проверка обязательных полей
  const requiredFields = {
    org_name: "Название организации",
    phone_number: "Телефон",
    address: "Адрес",
    inn: "ИНН",
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !req.body[field])
    .map(([_, name]) => name);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Не заполнены обязательные поля",
      errors: {
        _general: `Заполните обязательные поля: ${missingFields.join(", ")}`,
        ...Object.fromEntries(
          Object.keys(requiredFields)
            .filter((field) => !req.body[field])
            .map((field) => [field, "Обязательное поле"])
        ),
      },
    });
  }

  // Валидация данных
  const validationErrors = validateSupplierData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Ошибки валидации данных",
      errors: validationErrors,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suppliers (org_name, phone_number, address, inn) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [org_name, phone_number, address, inn]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Поставщик успешно добавлен",
    });
  } catch (err) {
    console.error(err);

    // Обработка дубликатов
    if (err.code === "23505") {
      const constraint = err.constraint;
      let field = "";
      if (constraint === "suppliers_inn_key") field = "inn";
      if (constraint === "suppliers_phone_number_key") field = "phone_number";

      return res.status(409).json({
        success: false,
        message: "Ошибка при создании поставщика",
        errors: {
          [field]: `Поставщик с таким ${
            field === "inn" ? "ИНН" : "телефоном"
          } уже существует`,
          _general: `Поставщик с таким ${
            field === "inn" ? "ИНН" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при добавлении поставщика",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { org_name, phone_number, address, inn } = req.body;

  // Проверка обязательных полей
  const requiredFields = {
    org_name: "Название организации",
    phone_number: "Телефон",
    address: "Адрес",
    inn: "ИНН",
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !req.body[field])
    .map(([_, name]) => name);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Не заполнены обязательные поля",
      errors: {
        _general: `Заполните обязательные поля: ${missingFields.join(", ")}`,
        ...Object.fromEntries(
          Object.keys(requiredFields)
            .filter((field) => !req.body[field])
            .map((field) => [field, "Обязательное поле"])
        ),
      },
    });
  }

  // Валидация данных
  const validationErrors = validateSupplierData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Ошибки валидации данных",
      errors: validationErrors,
    });
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
      return res.status(404).json({
        success: false,
        message: "Поставщик не найден",
        errors: { _general: "Поставщик с указанным ID не существует" },
      });
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

    res.json({
      success: true,
      data: result.rows[0],
      message: "Данные поставщика успешно обновлены",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления поставщика:", err);

    // Обработка дубликатов
    if (err.code === "23505") {
      const constraint = err.constraint;
      let field = "";
      if (constraint === "suppliers_inn_key") field = "inn";
      if (constraint === "suppliers_phone_number_key") field = "phone_number";

      return res.status(409).json({
        success: false,
        message: "Ошибка при обновлении поставщика",
        errors: {
          [field]: `Поставщик с таким ${
            field === "inn" ? "ИНН" : "телефоном"
          } уже существует`,
          _general: `Поставщик с таким ${
            field === "inn" ? "ИНН" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении поставщика",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
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
