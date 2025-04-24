const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authenticate = require("../../middleware/auth");

router.get("/:id/materials", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        om.order_material_id,
        om.quantity,
        m.material_id,
        m.material_name,
        m.cost_per_unit,
        m.unit,
        m.type
       FROM order_materials om
       JOIN materials m ON om.material_id = m.material_id
       WHERE om.order_id = $1`,
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching order materials:", {
      error: err.message,
      orderId: req.params.id,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      error: "Ошибка при получении материалов заказа",
      details: err.message,
    });
  }
});

router.post("/:id/materials", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { material_id, quantity } = req.body;

    // Валидация входных данных
    if (!material_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: "Неверные параметры запроса",
        details: "Требуются material_id и положительное quantity",
      });
    }

    const orderCheck = await pool.query(
      "SELECT use_own_materials FROM orders WHERE order_id = $1",
      [req.params.id]
    );

    if (orderCheck.rows[0]?.use_own_materials) {
      return res.status(400).json({
        error: "Невозможно добавить материалы",
        details: "Заказ использует материалы клиента",
      });
    }

    // 1. Проверка доступности материала
    const materialCheck = await client.query(
      `SELECT quantity, material_name FROM materials 
       WHERE material_id = $1 FOR UPDATE`,
      [material_id]
    );

    if (materialCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Материал не найден",
        details: `Material with id ${material_id} not found`,
      });
    }

    const availableQuantity = materialCheck.rows[0].quantity;
    const materialName = materialCheck.rows[0].material_name;

    if (availableQuantity < quantity) {
      return res.status(409).json({
        error: "Недостаточно материала на складе",
        details: {
          requested: quantity,
          available: availableQuantity,
          material_name: materialName,
        },
      });
    }

    // 2. Добавление материала в заказ
    const insertResult = await client.query(
      `INSERT INTO order_materials 
       (order_id, material_id, quantity) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.params.id, material_id, quantity]
    );

    // 3. Обновление остатка на складе
    await client.query(
      `UPDATE materials 
       SET quantity = quantity - $1 
       WHERE material_id = $2`,
      [quantity, material_id]
    );

    await client.query("COMMIT");

    // Логирование успешной операции
    console.log("Material added to order:", {
      orderId: req.params.id,
      materialId: material_id,
      quantity: quantity,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding material to order:", {
      error: err.message,
      orderId: req.params.id,
      body: req.body,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      error: "Ошибка при добавлении материала к заказу",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

router.put("/:orderId/materials/:materialId", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { quantity } = req.body;

    // 1. Получаем текущее количество
    const current = await client.query(
      `SELECT material_id, quantity 
       FROM order_materials 
       WHERE order_material_id = $1`,
      [req.params.materialId]
    );

    // 2. Вычисляем разницу
    const diff = quantity - current.rows[0].quantity;

    // 3. Обновляем запись
    const updateResult = await client.query(
      `UPDATE order_materials 
       SET quantity = $1 
       WHERE order_material_id = $2 
       RETURNING *`,
      [quantity, req.params.materialId]
    );

    // 4. Обновляем склад
    await client.query(
      `UPDATE materials 
       SET quantity = quantity - $1 
       WHERE material_id = $2`,
      [diff, current.rows[0].material_id]
    );

    await client.query("COMMIT");
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.delete(
  "/:orderId/materials/:materialId",
  authenticate,
  async (req, res) => {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Получаем информацию о материале для возврата на склад
      const materialQuery = await client.query(
        `SELECT om.quantity, om.material_id, m.material_name
       FROM order_materials om
       JOIN materials m ON om.material_id = m.material_id
       WHERE om.order_material_id = $1`,
        [req.params.materialId]
      );

      if (materialQuery.rows.length === 0) {
        return res.status(404).json({
          error: "Материал в заказе не найден",
          details: `Order material with id ${req.params.materialId} not found`,
        });
      }

      const { quantity, material_id, material_name } = materialQuery.rows[0];

      // 2. Возвращаем материал на склад
      await client.query(
        `UPDATE materials 
       SET quantity = quantity + $1 
       WHERE material_id = $2`,
        [quantity, material_id]
      );

      // 3. Удаляем материал из заказа
      await client.query(
        `DELETE FROM order_materials 
       WHERE order_material_id = $1`,
        [req.params.materialId]
      );

      await client.query("COMMIT");

      // Логирование успешной операции
      console.log("Material removed from order:", {
        orderId: req.params.orderId,
        materialId: material_id,
        materialName: material_name,
        quantityReturned: quantity,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error removing material from order:", {
        error: err.message,
        orderId: req.params.orderId,
        materialId: req.params.materialId,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({
        error: "Ошибка при удалении материала из заказа",
        details: err.message,
      });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
