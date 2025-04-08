require("dotenv").config();

const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    console.log("GOVNOOOO " + process.env.JWT_SECRET);
    const decoded = jwt.verify(token, "my_super_secret_key_at_least_32_chars");
    console.log("Decoded token:", decoded);

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [decoded.userId]
    );
    console.log("User found:", rows[0]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    req.user = rows[0];
    next();
    console.log("Decoded token:", decoded);
    console.log("Is admin:", rows[0].is_admin);
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: "Неверный токен" });
  }
};
