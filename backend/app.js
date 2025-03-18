const express = require("express");
const cors = require("cors");
const app = express();

// Роуты
const clientsRouter = require("./routes/clients");
const jobPositionsRouter = require("./routes/jobPositions");
const statusesRouter = require("./routes/statuses");
const materialTypesRouter = require("./routes/materialTypes");
const statesRouter = require("./routes/machineStates");
const paymentMethodsRouter = require("./routes/paymentMethods");
const suppliersRouter = require("./routes/suppliers");
const employeesRouter = require("./routes/employees");

app.use(cors());
app.use(express.json());

app.use("/clients", clientsRouter);
app.use("/job-positions", jobPositionsRouter);
app.use("/statuses", statusesRouter);
app.use("/material-types", materialTypesRouter);
app.use("/states", statesRouter);
app.use("/payment-methods", paymentMethodsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/employees", employeesRouter);

module.exports = app;
