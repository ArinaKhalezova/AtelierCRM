const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function initializeSuperAdmin() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Проверяем существование супер-админа
    const { rows } = await client.query(
      `SELECT user_id FROM users 
       WHERE role = 'Старший администратор' 
       LIMIT 1`
    );

    if (rows.length === 0) {
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash("admin", 10);

      // Создаем супер-админа
      const user = await client.query(
        `INSERT INTO users 
         (fullname, phone_number, email, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING user_id`,
        [
          "Супер Админ",
          "+70000000000",
          "admin@atelier.ru",
          hashedPassword,
          "Старший администратор",
        ]
      );

      // Добавляем в таблицу сотрудников
      await client.query(
        `INSERT INTO employees 
         (user_id, position) 
         VALUES ($1, $2)`,
        [user.rows[0].user_id, "Старший администратор"]
      );

      console.log(
        "Супер-админ успешно создан. Email: admin@atelier.ru, пароль: admin"
      );
    } else {
      console.log("Супер-админ уже существует в системе");
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка инициализации супер-админа:", err);
    throw err; // Пробрасываем ошибку дальше
  } finally {
    client.release();
  }
}

module.exports = initializeSuperAdmin;
