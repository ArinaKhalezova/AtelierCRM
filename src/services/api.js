//src\services\index.js
import auth from "./api/auth";
import clients from "./api/clients";
import suppliers from "./api/suppliers";
import employees from "./api/employees";
import materials from "./api/materials";
import services from "./api/services";
import orders from "./api/orders";
import orderDetails from "./api/orderDetails";
import deliveries from "./api/deliveries";
import fittings from "./api/fittings";

export default {
  auth,
  clients,
  suppliers,
  employees,
  materials,
  services,
  orders,
  orderDetails,
  deliveries,
  fittings,
};
