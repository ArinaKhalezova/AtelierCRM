const express = require("express");
const router = express.Router();

// Импорт всех подроутеров
const mainRouter = require("./order.main");
const statusRouter = require("./order.status");
const servicesRouter = require("./order.services");
const materialsRouter = require("./order.materials");
const measurementsRouter = require("./order.measurements");
const utilsRouter = require("./order.utils");
const fittingsRouter = require("./order.fittings");

// Композиция роутеров
router.use("/", mainRouter);
router.use("/", statusRouter);
router.use("/", servicesRouter);
router.use("/", materialsRouter);
router.use("/", measurementsRouter);
router.use("/", utilsRouter);
router.use("/", fittingsRouter);

module.exports = router;
