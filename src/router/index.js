import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "vuex";
import LoginView from "@/views/Auth/LoginView.vue";
import RegisterView from "@/views/Auth/RegisterView.vue";

import HomeView from "../views/HomeView.vue";
import OrdersView from "@/views/OrdersView.vue";
import NewOrder from "@/components/Orders/NewOrder.vue";
import ServicesView from "../views/ServicesView.vue";
import EmployeesView from "@/views/EmployeesView.vue";
import OrderDetails from "@/components/Orders/OrderDetails.vue";
import DeliveriesView from "@/views/DeliveriesView.vue";
import ClientsView from "@/views/ClientsView.vue";
import DataView from "@/views/DataView.vue";

import api from "@/services/api";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "Вход в систему" },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { title: "Регистрация" },
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { title: "Главная" },
  },
  {
    path: "/orders",
    name: "orders",
    component: OrdersView,
    meta: { title: "Заказы" },
  },
  {
    path: "/orders/new",
    name: "new-order",
    component: NewOrder,
    meta: { title: "Новый заказ" },
  },
  {
    path: "/orders/:id",
    name: "order-details",
    component: OrderDetails,
    meta: { title: "Детали заказа" },
    props: true, // Передаем параметр id как prop
  },
  {
    path: "/services",
    name: "services",
    component: ServicesView,
    meta: { title: "Услуги" },
  },
  {
    path: "/deliveries",
    name: "deliveries",
    component: DeliveriesView,
    meta: { title: "Поставки" },
  },
  {
    path: "/clients",
    name: "clients",
    component: ClientsView,
    meta: { title: "Клиенты" },
  },
  {
    path: "/employees",
    name: "employees",
    component: EmployeesView,
    meta: { title: "Сотрудники" },
  },
  {
    path: "/data",
    name: "data",
    component: DataView,
    meta: { title: "Данные" },
  },
  // Добавим редирект для несуществующих страниц
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Плавная прокрутка к началу страницы при переходе
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  const store = useStore();
  const isAuthRoute = to.name === "login" || to.name === "register";

  // Проверяем авторизацию через Vuex
  const isAuthenticated = await store.dispatch("auth/checkAuth");

  if (!isAuthenticated && !isAuthRoute) {
    return next("/login");
  }

  if (isAuthenticated && isAuthRoute) {
    return next("/");
  }

  next();
});

export default router;
