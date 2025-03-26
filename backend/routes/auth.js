const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Добавьте этот middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_secret_key",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

// Проверка авторизации
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT user_id, fullname, email, role FROM users WHERE user_id = $1",
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Логин
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Простая валидация
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }

  try {
    console.log("Attempting login for email:", email); // Логирование

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      console.log("User not found for email:", email);
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    console.log("User found:", user.rows[0].email); // Логирование

    // Проверка пароля
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!validPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    // Генерация токена
    const token = jwt.sign(
      {
        userId: user.rows[0].user_id,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    console.log("Login successful for user:", email); // Логирование

    res.json({
      token,
      user: {
        id: user.rows[0].user_id,
        email: user.rows[0].email,
        role: user.rows[0].role,
        fullname: user.rows[0].fullname,
      },
    });
  } catch (err) {
    console.error("Login error:", err); // Подробное логирование ошибки
    res.status(500).json({
      error: "Ошибка сервера при входе",
      details: err.message,
    });
  }
});

// Регистрация нового пользователя
router.post("/register", async (req, res) => {
  const { fullname, phone_number, email, password, role } = req.body;

  // Проверка обязательных полей
  if (!fullname || !phone_number || !email || !password) {
    return res.status(400).json({
      error: "Все поля обязательны для заполнения",
    });
  }

  try {
    // Проверяем, нет ли уже пользователя с таким email или телефоном
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $2",
      [email, phone_number]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: "Пользователь с таким email или телефоном уже существует",
      });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем пользователя
    const newUser = await pool.query(
      "INSERT INTO users (fullname, phone_number, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [fullname, phone_number, email, hashedPassword, role || "Работник"]
    );

    // Если регистрируется работник, создаем запись в employees
    if (role === "Работник") {
      await pool.query(
        "INSERT INTO employees (user_id, position) VALUES ($1, $2)",
        [newUser.rows[0].user_id, "Швея"] // Позиция по умолчанию
      );
    }

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
