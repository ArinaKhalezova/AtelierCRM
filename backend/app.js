const express = require("express");
const cors = require("cors");
const app = express();

// Роуты
const authRouter = require("./routes/auth");
const clientsRouter = require("./routes/clients");
const suppliersRouter = require("./routes/suppliers");
const employeesRouter = require("./routes/employees");
const deliveriesRouter = require("./routes/deliveries");
const materialsRouter = require("./routes/materials");
const servicesRouter = require("./routes/services");
const ordersRouter = require("./routes/orders");

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/employees", employeesRouter);
app.use("/deliveries", deliveriesRouter);
app.use("/materials", materialsRouter);
app.use("/services", servicesRouter);
app.use("/orders", ordersRouter);

module.exports = app;
