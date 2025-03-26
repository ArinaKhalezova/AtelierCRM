import { createStore } from "vuex";

import auth from "./modules/auth";
import clients from "./modules/clients";
import suppliers from "./modules/suppliers";
import employees from "./modules/employees";
import deliveries from "./modules/deliveries";
import materials from "./modules/materials";
import services from "./modules/services";
import orders from "./modules/orders";
import orderDetails from "./modules/orderDetails";

export default createStore({
  modules: {
    auth,
    clients,
    suppliers,
    employees,
    deliveries,
    materials,
    services,
    orders,
    orderDetails,
  },
});
