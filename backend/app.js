const express = require("express");
const cors = require("cors");
const app = express();

// Роуты
const jobPositionsRouter = require("./routes/jobPositions");
const statusesRouter = require("./routes/statuses");
// ...импорт остальных роутов

app.use(cors());
app.use(express.json());

app.use("/job-positions", jobPositionsRouter);
app.use("/statuses", statusesRouter);
// ...регистрация остальных роутов

module.exports = app;
