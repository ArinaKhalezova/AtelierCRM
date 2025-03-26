const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "atelierCRM",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

// Проверка подключения
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
    process.exit(1); // Завершаем процесс при ошибке подключения
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = pool;
