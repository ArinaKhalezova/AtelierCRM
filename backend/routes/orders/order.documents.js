const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const multer = require("multer");
const path = require("path");
const authenticate = require("../../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5, // Максимум 5 файлов
  },
  fileFilter: (req, file, cb) => {
    // Логируем получение файлов
    console.log(
      `Received file: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`
    );
    cb(null, true);
  },
}).array("documents"); // Явно указываем имя поля и количество

// Проверка прав администратора
const checkAdmin = (req, res, next) => {
  if (!["Администратор", "Старший администратор"].includes(req.user.role)) {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
  next();
};

// Получение документов заказа
router.get("/:orderId/documents", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        d.document_id,
        d.document_name,
        d.document_type,
        d.uploaded_at,
        u.fullname as uploaded_by
       FROM order_documents d
       JOIN users u ON d.uploaded_by = u.user_id
       WHERE d.order_id = $1
       ORDER BY d.uploaded_at DESC`,
      [req.params.orderId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: "Ошибка получения документов" });
  }
});

// Загрузка документа
router.post(
  "/:orderId/documents",
  authenticate,
  checkAdmin,
  (req, res, next) => {
    // Обрабатываем загрузку через middleware
    upload(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(400).json({
          error:
            err instanceof multer.MulterError
              ? `Ошибка загрузки файлов: ${err.message}`
              : "Ошибка обработки файлов",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      console.log("Upload request body:", req.body);
      console.log("Uploaded files:", req.files);

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "Файлы не были получены сервером" });
      }

      const documents = await Promise.all(
        // req.files.map(async (file) => {
        //   const documentName = Buffer.from(
        //     file.originalname,
        //     "latin1"
        //   ).toString("utf8");
        req.files.map(async (file) => {
          // Исправляем декодирование имени файла
          const documentName = Buffer.from(
            file.originalname,
            "latin1"
          ).toString("utf8");

          const { rows } = await pool.query(
            `INSERT INTO order_documents 
             (order_id, document_name, document_data, document_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING document_id`,
            [
              req.params.orderId,
              documentName,
              file.buffer,
              req.body.type,
              req.user.user_id,
            ]
          );

          return {
            document_id: rows[0].document_id,
            document_name: documentName,
            document_type: req.body.type,
            status: "success",
          };
        })
      );

      res.json({
        message: "Файлы успешно загружены",
        uploadedFiles: documents,
      });
    } catch (err) {
      console.error("Server processing error:", err);
      res.status(500).json({
        error: "Внутренняя ошибка сервера",
        details: err.message,
      });
    }
  }
);

// Скачивание документа
router.get(
  "/documents/:documentId/download",
  authenticate,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT document_name, document_data 
         FROM order_documents 
         WHERE document_id = $1`,
        [req.params.documentId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      const { document_name, document_data } = rows[0];
      const safeFilename = encodeURIComponent(document_name);

      console.log("SAGE FILENAME!!!! " + safeFilename);
      console.log("FILENAME!!!! " + document_name);

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`
      );
      res.send(document_data);
    } catch (err) {
      console.error("Error downloading document:", err);
      res.status(500).json({ error: "Ошибка скачивания документа" });
    }
  }
);

// Удаление документа
router.delete(
  "/documents/:documentId",
  authenticate,
  checkAdmin,
  async (req, res) => {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM order_documents WHERE document_id = $1",
        [req.params.documentId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      res.status(204).send();
    } catch (err) {
      console.error("Error deleting document:", err);
      res.status(500).json({ error: "Ошибка удаления документа" });
    }
  }
);

module.exports = router;
