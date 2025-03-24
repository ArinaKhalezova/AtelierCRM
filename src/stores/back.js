import { createStore } from "vuex";

import clients from "./modules/clients";
import suppliers from "./modules/suppliers";
import employees from "./modules/employees";
import deliveries from "./modules/deliveries";
import materials from "./modules/materials";
import services from "./modules/services";

export default createStore({
  modules: {
    clients,
    suppliers,
    employees,
    deliveries,
    materials,
    services,
  },
});
