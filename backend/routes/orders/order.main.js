const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authenticate = require("../../middleware/auth");

// Получение всех заказов
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        o.order_id,
        o.tracking_number,
        o.status,
        o.total_cost,
        o.fitting_date,
        o.deadline_date,
        o.comment,
        o.created_at,
        c.fullname as client_name,
        c.phone_number as client_phone
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.client_id
      ORDER BY o.order_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error in GET /orders:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

router.get("/assigned-to-me", authenticate, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // Логируем пользователя

    const userId = req.user.user_id;
    console.log("User ID:", userId);

    const employeeQuery = await pool.query(
      "SELECT employee_id FROM employees WHERE user_id = $1",
      [userId]
    );
    console.log("Employee query result:", employeeQuery.rows);

    if (employeeQuery.rows.length === 0) {
      console.log("Employee not found for user:", userId);
      return res.status(404).json({ error: "Сотрудник не найден" });
    }

    const employeeId = employeeQuery.rows[0].employee_id;
    console.log("Employee ID:", employeeId);

    const { rows } = await pool.query(
      `SELECT 
        o.order_id,
        o.tracking_number,
        o.status,
        o.total_cost::float, 
        o.fitting_date,
        o.deadline_date,
        o.comment,
        o.created_at,
        c.fullname as client_name,
        c.phone_number as client_phone
       FROM orders o
       JOIN order_employees oe ON o.order_id = oe.order_id
       JOIN clients c ON o.client_id = c.client_id
       WHERE oe.employee_id = $1
         AND o.status NOT IN ('Отменен')
       ORDER BY o.created_at DESC`,
      [employeeId]
    );
    console.log("Found orders:", rows.length);

    res.json(
      rows.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        deadline_date: row.deadline_date
          ? new Date(row.deadline_date).toISOString()
          : null,
      }))
    );
  } catch (err) {
    console.error("Ошибка в /orders/assigned-to-me:", err);
    res.status(500).json({
      error: "Ошибка сервера",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Получение сотрудников, назначенных на заказ
router.get("/:id/employees", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        e.employee_id,
        u.fullname,
        e.position
      FROM order_employees oe
      JOIN employees e ON oe.employee_id = e.employee_id
      JOIN users u ON e.user_id = u.user_id
      WHERE oe.order_id = $1
    `,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching order employees:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Получение деталей заказа
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.fullname as client_name 
       FROM orders o
       JOIN clients c ON o.client_id = c.client_id
       WHERE o.order_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Создание заказа
router.post("/", async (req, res) => {
  const { client_id, fitting_date, deadline_date, comment, total_cost } =
    req.body;

  if (!client_id || !total_cost) {
    return res.status(400).json({ error: "Необходимы client_id и total_cost" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Генерация tracking_number в транзакции
    const tracking_number = await generateDateBasedCode(client);

    const { rows } = await client.query(
      `INSERT INTO orders 
       (client_id, tracking_number, status, fitting_date, deadline_date, comment, total_cost, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [
        client_id,
        tracking_number,
        "Новый", // Добавляем статус по умолчанию
        fitting_date || null, // Разрешаем NULL для необязательных полей
        deadline_date,
        comment || null,
        total_cost,
      ]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.status(500).json({
      error: "Ошибка при создании заказа",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    client.release();
  }
});

// Назначение сотрудника на заказ
router.post("/:id/assign-employee", authenticate, async (req, res) => {
  if (req.user.role !== "Администратор") {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
  const { id } = req.params;
  const { employee_id } = req.body;

  if (!employee_id) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  try {
    // Проверяем, существует ли сотрудник
    const employeeCheck = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1",
      [employee_id]
    );
    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Проверяем, существует ли заказ
    const orderCheck = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [id]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Проверяем, не назначен ли уже этот сотрудник
    const existingAssignment = await pool.query(
      "SELECT * FROM order_employees WHERE order_id = $1 AND employee_id = $2",
      [id, employee_id]
    );
    if (existingAssignment.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Employee is already assigned to this order" });
    }

    // Назначаем сотрудника
    const { rows } = await pool.query(
      "INSERT INTO order_employees (order_id, employee_id) VALUES ($1, $2) RETURNING *",
      [id, employee_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error assigning employee to order:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Удаление сотрудника из заказа
router.delete(
  "/:orderId/employees/:employeeId",
  authenticate,
  async (req, res) => {
    if (req.user.role !== "Администратор") {
      return res.status(403).json({ error: "Доступ запрещен" });
    }
    const { orderId, employeeId } = req.params;

    try {
      const { rowCount } = await pool.query(
        "DELETE FROM order_employees WHERE order_id = $1 AND employee_id = $2",
        [orderId, employeeId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.status(204).send();
    } catch (err) {
      console.error("Error removing employee from order:", err);
      res.status(500).json({ error: "Database error", details: err.message });
    }
  }
);

// Обновленные функции генерации кода
async function generateDateBasedCode(client) {
  const now = new Date();
  const datePart =
    now.getDate().toString().padStart(2, "0") +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getFullYear().toString().slice(-2);

  const lastNumber = await getLastOrderNumberForToday(client, datePart);
  const seqPart = (lastNumber + 1).toString().padStart(3, "0");

  return `${datePart}-${seqPart}`;
}

async function getLastOrderNumberForToday(client, datePart) {
  const { rows } = await client.query(
    `SELECT tracking_number 
     FROM orders 
     WHERE tracking_number LIKE $1
     ORDER BY order_id DESC 
     LIMIT 1`,
    [`${datePart}-%`]
  );

  if (rows.length === 0) return 0;

  const lastNumber = parseInt(rows[0].tracking_number.split("-")[1]);
  return isNaN(lastNumber) ? 0 : lastNumber;
}

// Редактирование заказа
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fitting_date, deadline_date, comment } = req.body;

  // Валидация обязательных полей
  if (!deadline_date) {
    return res.status(400).json({ error: "Необходима дата завершения" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE orders 
       SET 
         fitting_date = $1,
         deadline_date = $2,
         comment = $3
       WHERE order_id = $4
       RETURNING *`,
      [fitting_date, deadline_date, comment, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({
      error: "Ошибка при обновлении заказа",
      details: err.message,
    });
  }
});

// Удаление заказа
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "Администратор") {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Блокировка заказа и проверка статуса
    const orderCheck = await client.query(
      "SELECT status FROM orders WHERE order_id = $1 FOR UPDATE",
      [req.params.id]
    );

    if (orderCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Заказ не найден" });
    }

    const orderStatus = orderCheck.rows[0].status;
    if (["В работе", "Выполнен"].includes(orderStatus)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Нельзя удалить заказ в статусе ${orderStatus}`,
      });
    }

    // Удаление связанных записей в правильном порядке
    await client.query(
      `
      DELETE FROM order_status_history 
      WHERE order_service_id IN (
        SELECT order_service_id 
        FROM order_services 
        WHERE order_id = $1
      )
    `,
      [req.params.id]
    );

    await client.query("DELETE FROM order_employees WHERE order_id = $1", [
      req.params.id,
    ]);
    await client.query(
      "DELETE FROM order_status_history_order WHERE order_id = $1",
      [req.params.id]
    );
    await client.query("DELETE FROM order_materials WHERE order_id = $1", [
      req.params.id,
    ]);
    await client.query("DELETE FROM order_services WHERE order_id = $1", [
      req.params.id,
    ]);
    await client.query("DELETE FROM orders WHERE order_id = $1", [
      req.params.id,
    ]);

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Заказ успешно удален",
      order_id: req.params.id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка удаления заказа:", err);
    res.status(500).json({
      error: "Ошибка при удалении заказа",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
