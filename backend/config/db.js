const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "atelierCRM",
  password: "postgres",
  port: 5432,
});

// Проверка подключения
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = pool;
