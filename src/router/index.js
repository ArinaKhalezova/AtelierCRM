import { createRouter, createWebHistory } from "vue-router";
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
import EmployeeOrderList from "@/components/Orders/EmployeeOrderList.vue";

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
    props: true,
  },
  {
    path: "/services",
    name: "services",
    component: ServicesView,
    meta: { title: "Услуги", requiresAdmin: true },
  },
  {
    path: "/deliveries",
    name: "deliveries",
    component: DeliveriesView,
    meta: { title: "Поставки", requiresAdmin: true },
  },
  {
    path: "/clients",
    name: "clients",
    component: ClientsView,
    meta: { title: "Клиенты", requiresAdmin: true },
  },
  {
    path: "/employees",
    name: "employees",
    component: EmployeesView,
    meta: {
      title: "Сотрудники",
      requiresAdmin: true,
    },
  },
  {
    path: "/data",
    name: "data",
    component: DataView,
    meta: { title: "Данные", requiresAdmin: true },
  },
  {
    path: "/my-orders",
    name: "MyOrders",
    component: EmployeeOrderList,
    meta: {
      requiresAuth: true,
      requiresEmployee: true,
    },
  },
  //редирект для несуществующих страниц
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Создаем функцию для инициализации роутера с хранилищем
export function setupRouter(app, store) {
  router.beforeEach(async (to, from, next) => {
    const isAuthRoute = to.name === "login" || to.name === "register";

    try {
      // Проверяем авторизацию
      const isAuthenticated = await store.dispatch("auth/checkAuth");

      if (!isAuthenticated && !isAuthRoute) {
        return next("/login");
      }

      // Проверяем права доступа
      if (isAuthenticated) {
        const isAdmin = store.getters["auth/isAdmin"];
        const isEmployee = !isAdmin;

        if (to.meta.requiresAdmin && !isAdmin) {
          return next("/");
        }
        if (to.meta.requiresEmployee && !isEmployee) {
          return next("/orders");
        }
      }

      next();
    } catch (error) {
      console.error("Router error:", error);
      next("/login");
    }
  });

  return router;
}

export default router;
