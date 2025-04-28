require("dotenv").config();

const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Неверный формат токена" });
    }

    const decoded = jwt.verify(token, "my_super_secret_key_at_least_32_chars");
    req.user = decoded;

    const { rows } = await pool.query(
      "SELECT user_id, fullname, email, role FROM users WHERE user_id = $1",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    req.user = {
      ...rows[0],
      isSuperAdmin: rows[0].role === "Старший администратор",
    };
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Токен истек" });
    }
    return res.status(401).json({ error: "Неверный токен" });
  }
};
