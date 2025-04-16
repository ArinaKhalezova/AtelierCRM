const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const validate = require("../validation");

// Вспомогательная функция для валидации данных сотрудника
function validateEmployeeData(data, isUpdate = false) {
  const errors = {};

  // Валидация ФИО
  const fullnameError = validate.fullname(data.fullname);
  if (fullnameError) errors.fullname = fullnameError;

  // Валидация телефона
  const phoneError = validate.phone(data.phone_number);
  if (phoneError) errors.phone_number = phoneError;

  // Валидация email (не обязателен)
  const emailError = validate.email(data.email);
  if (emailError) errors.email = emailError;

  // Валидация пароля (только при создании)
  if (!isUpdate) {
    const passwordError = validate.password(data.password);
    if (passwordError) errors.password = passwordError;
  }

  // Валидация должности
  if (!data.position) errors.position = "Должность обязательна для заполнения";

  return Object.keys(errors).length > 0 ? errors : null;
}

// Получение всех сотрудников
router.get("/", async (req, res) => {
  try {
    let query;
    let params = [];

    // Проверяем роль из токена (req.user добавляется middleware auth)
    if (req.user?.role === "Старший администратор") {
      query = `
        SELECT 
          e.employee_id,
          u.fullname,
          e.position,
          u.phone_number,
          u.email,
          u.password_hash 
        FROM employees e
        JOIN users u ON e.user_id = u.user_id
      `;
    } else {
      query = `
        SELECT 
          e.employee_id,
          u.fullname,
          e.position,
          u.phone_number,
          u.email
        FROM employees e
        JOIN users u ON e.user_id = u.user_id
      `;
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({
      error: "Database error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
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

  // Проверка обязательных полей
  const requiredFields = {
    fullname: "ФИО",
    phone_number: "Телефон",
    password: "Пароль",
    position: "Должность",
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
  const validationErrors = validateEmployeeData(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Ошибки валидации данных",
      errors: validationErrors,
    });
  }

  try {
    await pool.query("BEGIN");

    // Создание пользователя
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await pool.query(
      "INSERT INTO users (fullname, phone_number, email, password_hash, role) VALUES ($1, $2, $3, $4, 'Работник') RETURNING user_id",
      [fullname, phone_number, email, hashedPassword]
    );

    const userId = userResult.rows[0].user_id;

    // Создание сотрудника
    const employeeResult = await pool.query(
      "INSERT INTO employees (user_id, position) VALUES ($1, $2) RETURNING *",
      [userId, position]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      data: employeeResult.rows[0],
      message: "Сотрудник успешно добавлен",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);

    // Обработка ошибки дубликата
    if (err.code === "23505") {
      const detail = err.detail.toLowerCase();
      let field = "";
      if (detail.includes("email")) field = "email";
      if (detail.includes("phone_number")) field = "phone_number";

      return res.status(400).json({
        success: false,
        message: "Ошибка при создании сотрудника",
        errors: {
          [field]: `Такой ${
            field === "email" ? "email" : "телефон"
          } уже существует`,
          _general: `Сотрудник с таким ${
            field === "email" ? "email" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при создании сотрудника",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Редактирование сотрудника
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fullname, phone_number, email, position } = req.body;

  // Проверка обязательных полей
  const requiredFields = {
    fullname: "ФИО",
    phone_number: "Телефон",
    position: "Должность",
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
  const validationErrors = validateEmployeeData(req.body, true);
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

    // 1. Проверяем существование сотрудника
    const employeeExists = await client.query(
      "SELECT user_id FROM employees WHERE employee_id = $1",
      [id]
    );

    if (!employeeExists.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Сотрудник не найден",
        errors: {
          _general: "Сотрудник с указанным ID не существует",
        },
      });
    }

    const userId = employeeExists.rows[0].user_id;

    // 2. Обновляем данные пользователя
    await client.query(
      `UPDATE users SET 
        fullname = $1,
        phone_number = $2,
        email = $3
       WHERE user_id = $4`,
      [fullname, phone_number, email, userId]
    );

    // 3. Обновляем должность сотрудника
    await client.query(
      `UPDATE employees SET 
        position = $1
       WHERE employee_id = $2`,
      [position, id]
    );

    // 4. Получаем обновленные данные
    const updatedEmployee = await client.query(
      `SELECT e.employee_id, u.fullname, u.phone_number, u.email, e.position 
       FROM employees e
       JOIN users u ON e.user_id = u.user_id
       WHERE e.employee_id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      data: updatedEmployee.rows[0],
      message: "Данные сотрудника успешно обновлены",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления сотрудника:", err);

    // Обработка ошибки дубликата
    if (err.code === "23505") {
      const detail = err.detail.toLowerCase();
      let field = "";
      if (detail.includes("email")) field = "email";
      if (detail.includes("phone_number")) field = "phone_number";

      return res.status(400).json({
        success: false,
        message: "Ошибка при обновлении сотрудника",
        errors: {
          [field]: `Такой ${
            field === "email" ? "email" : "телефон"
          } уже существует`,
          _general: `Сотрудник с таким ${
            field === "email" ? "email" : "телефоном"
          } уже зарегистрирован`,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении сотрудника",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    client.release();
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
