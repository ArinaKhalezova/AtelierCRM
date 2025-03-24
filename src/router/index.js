import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import OrdersView from "../views/OrdersView.vue";
import ServicesView from "../views/ServicesView.vue";
import EmployeesView from "@/views/EmployeesView.vue";
import OrderDetails from "@/components/Orders/OrderDetails.vue";
import DeliveriesView from "@/views/DeliveriesView.vue";
import ClientsView from "@/views/ClientsView.vue";
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
    path: "/orders/:id",
    name: "order-details",
    component: OrderDetails,
  },
  {
    path: "/services",
    name: "services",
    component: ServicesView,
  },
  {
    path: "/deliveries",
    name: "deliveries",
    component: DeliveriesView,
  },
  {
    path: "/clients",
    name: "clients",
    component: ClientsView,
  },
  {
    path: "/employees",
    name: "employees",
    component: EmployeesView,
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
