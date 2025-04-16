const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const validate = require("../validation");

// Валидация данных клиента
function validateClientData(data) {
  const errors = {};

  // Валидация ФИО
  const fullnameError = validate.fullname(data.fullname);
  if (fullnameError) errors.fullname = fullnameError;

  // Валидация телефона
  const phoneError = validate.phone(data.phone_number);
  if (phoneError) errors.phone_number = phoneError;

  // Валидация email
  const emailError = validate.email(data.email);
  if (emailError) errors.email = emailError;

  return Object.keys(errors).length > 0 ? errors : null;
}

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

  // Проверка обязательных полей
  const requiredFields = {
    fullname: "ФИО",
    phone_number: "Телефон",
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
  const validationErrors = validateClientData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Ошибки валидации данных",
      errors: validationErrors,
    });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO clients (fullname, phone_number, email) VALUES ($1, $2, $3) RETURNING *",
      [fullname, phone_number, email]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
      message: "Клиент успешно добавлен",
    });
  } catch (err) {
    console.error(err);

    // Обработка дубликатов
    if (err.code === "23505") {
      const detail = err.detail.toLowerCase();
      let field = "";
      if (detail.includes("email")) field = "email";
      if (detail.includes("phone_number")) field = "phone_number";

      return res.status(400).json({
        success: false,
        message: "Ошибка при создании клиента",
        errors: {
          [field]: `Такой ${
            field === "email" ? "email" : "телефон"
          } уже существует`,
          _general: `Клиент с таким ${
            field === "email" ? "email" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при создании клиента",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fullname, phone_number, email } = req.body;

  // Проверка обязательных полей
  const requiredFields = {
    fullname: "ФИО",
    phone_number: "Телефон",
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
  const validationErrors = validateClientData(req.body);
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

    // Проверка существования клиента
    const clientExists = await client.query(
      "SELECT 1 FROM clients WHERE client_id = $1",
      [id]
    );

    if (!clientExists.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Клиент не найден",
        errors: { _general: "Клиент с указанным ID не существует" },
      });
    }

    // Обновление данных
    const result = await client.query(
      `UPDATE clients SET 
        fullname = $1,
        phone_number = $2,
        email = $3
       WHERE client_id = $4
       RETURNING *`,
      [fullname, phone_number, email, id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      data: result.rows[0],
      message: "Данные клиента успешно обновлены",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления клиента:", err);

    // Обработка дубликатов
    if (err.code === "23505") {
      const detail = err.detail.toLowerCase();
      let field = "";
      if (detail.includes("email")) field = "email";
      if (detail.includes("phone_number")) field = "phone_number";

      return res.status(400).json({
        success: false,
        message: "Ошибка при обновлении клиента",
        errors: {
          [field]: `Такой ${
            field === "email" ? "email" : "телефон"
          } уже существует`,
          _general: `Клиент с таким ${
            field === "email" ? "email" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении клиента",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
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
