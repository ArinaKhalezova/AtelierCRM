import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import OrdersView from "../views/OrdersView.vue";
import MaterialsView from "../views/MaterialsView.vue";
import ExecutorsView from "../views/ExecutorsView.vue";
import OrderDetails from "../components/Order/OrderDetails.vue";
import NewOrder from "../components/Order/NewOrder.vue";
import NewMaterial from "../components/Materials/NewMaterial.vue";
import NewExecutor from "../components/Executor/NewExecutor.vue";
import SuppliesView from "@/views/SuppliesView.vue";
import SettingsView from "@/views/SettingsView.vue";
import DataView from "@/views/DataView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/orders",
    name: "orders",
    component: OrdersView,
  },
  {
    path: "/orders/new",
    name: "new-order",
    component: NewOrder,
  },
  {
    path: "/orders/:id",
    name: "order-details",
    component: OrderDetails,
  },
  {
    path: "/materials",
    name: "materials",
    component: MaterialsView,
  },
  {
    path: "/materials/new",
    name: "new-material",
    component: NewMaterial,
  },
  {
    path: "/executors",
    name: "executors",
    component: ExecutorsView,
  },
  {
    path: "/executors/new",
    name: "new-executor",
    component: NewExecutor,
  },
  {
    path: "/supplies",
    name: "supplies",
    component: SuppliesView,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
  {
    path: "/data",
    name: "data",
    component: DataView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
