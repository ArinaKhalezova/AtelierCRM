<template>
  <div class="data-view">
    <h1>Таблицы из базы данных</h1>

    <div class="tables-container">
      <div
        class="table-section"
        v-for="(table, index) in filteredTables"
        :key="index"
      >
        <h2>{{ table.title }}</h2>
        <component
          :is="table.component"
          :data="table.data || []"
          :columns="table.columns"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import DataTable from "@/components/DataView/DataTable.vue";

const store = useStore();

const getSafeState = (module, field, defaultValue = []) => {
  return store.state[module]?.[field] || defaultValue;
};

const tables = computed(() => [
  {
    title: "Пользователи",
    component: DataTable,
    data: getSafeState("users", "users"),
    columns: [
      { key: "user_id", label: "ID" },
      { key: "fullname", label: "ФИО" },
      { key: "phone_number", label: "Телефон" },
      { key: "email", label: "Email" },
      { key: "role", label: "Роль" },
    ],
  },
  {
    title: "Клиенты",
    component: DataTable,
    data: getSafeState("clients", "clients"),
    columns: [
      { key: "client_id", label: "ID" },
      { key: "fullname", label: "ФИО" },
      { key: "phone_number", label: "Телефон" },
      { key: "email", label: "Email" },
    ],
  },
  {
    title: "Услуги",
    component: DataTable,
    data: getSafeState("services", "services"),
    columns: [
      { key: "service_id", label: "ID" },
      { key: "name", label: "Название" },
      { key: "category", label: "Категория" },
      { key: "base_cost", label: "Базовая стоимость" },
    ],
  },
  {
    title: "Материалы",
    component: DataTable,
    data: getSafeState("materials", "materials"),
    columns: [
      { key: "material_id", label: "ID" },
      { key: "material_name", label: "Название" },
      { key: "type", label: "Тип" },
      { key: "quantity", label: "Количество" },
      { key: "cost_per_unit", label: "Цена за единицу" },
    ],
  },
  {
    title: "Поставщики",
    component: DataTable,
    data: getSafeState("suppliers", "suppliers"),
    columns: [
      { key: "supplier_id", label: "ID" },
      { key: "org_name", label: "Организация" },
      { key: "phone_number", label: "Телефон" },
      { key: "inn", label: "ИНН" },
    ],
  },
  {
    title: "Поставки",
    component: DataTable,
    data: getSafeState("deliveries", "deliveries"),
    columns: [
      { key: "delivery_id", label: "ID" },
      { key: "supplier_id", label: "ID поставщика" },
      { key: "delivery_date", label: "Дата поставки" },
    ],
  },
  {
    title: "Материалы в поставках",
    component: DataTable,
    data: getSafeState("deliveryMaterials", "deliveryMaterials"),
    columns: [
      { key: "delivery_material_id", label: "ID" },
      { key: "delivery_id", label: "ID поставки" },
      { key: "material_id", label: "ID материала" },
      { key: "quantity", label: "Количество" },
      { key: "cost_per_unit", label: "Цена за единицу" },
    ],
  },
  {
    title: "Сотрудники",
    component: DataTable,
    data: getSafeState("employees", "employees"),
    columns: [
      { key: "employee_id", label: "ID" },
      { key: "user_id", label: "ID пользователя" },
      { key: "position", label: "Должность" },
    ],
  },
  {
    title: "Мерки клиентов",
    component: DataTable,
    data: getSafeState("measurements", "measurements"),
    columns: [
      { key: "measurement_id", label: "ID" },
      { key: "client_id", label: "ID клиента" },
      { key: "chest_size", label: "Обхват груди" },
      { key: "waist_size", label: "Обхват талии" },
      { key: "hip_size", label: "Обхват бедер" },
    ],
  },
  {
    title: "Заказы",
    component: DataTable,
    data: getSafeState("orders", "orders"),
    columns: [
      { key: "order_id", label: "ID" },
      { key: "client_id", label: "ID клиента" },
      { key: "tracking_number", label: "Номер заказа" },
      { key: "status", label: "Статус" },
      { key: "total_cost", label: "Общая стоимость" },
    ],
  },
  {
    title: "Услуги в заказе",
    component: DataTable,
    data: getSafeState("orderServices", "orderServices"),
    columns: [
      { key: "order_service_id", label: "ID" },
      { key: "order_id", label: "ID заказа" },
      { key: "service_id", label: "ID услуги" },
      { key: "status", label: "Статус" },
    ],
  },
  {
    title: "Материалы в заказе",
    component: DataTable,
    data: getSafeState("orderMaterials", "orderMaterials"),
    columns: [
      { key: "order_material_id", label: "ID" },
      { key: "order_id", label: "ID заказа" },
      { key: "material_id", label: "ID материала" },
      { key: "quantity", label: "Количество" },
    ],
  },
  {
    title: "Сотрудники в заказе",
    component: DataTable,
    data: getSafeState("orderEmployees", "orderEmployees"),
    columns: [
      { key: "order_employee_id", label: "ID" },
      { key: "order_id", label: "ID заказа" },
      { key: "employee_id", label: "ID сотрудника" },
    ],
  },
  {
    title: "История статусов",
    component: DataTable,
    data: getSafeState("orderStatusHistory", "orderStatusHistory"),
    columns: [
      { key: "history_id", label: "ID" },
      { key: "order_id", label: "ID заказа" },
      { key: "status", label: "Статус" },
      { key: "changed_at", label: "Дата изменения" },
    ],
  },
]);

const filteredTables = computed(() => 
  tables.value.filter(table => table.data && table.data.length > 0)
);

onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("users/fetchUsers"),
      store.dispatch("clients/fetchClients"),
      store.dispatch("services/fetchServices"),
      store.dispatch("materials/fetchMaterials"),
      store.dispatch("suppliers/fetchSuppliers"),
      store.dispatch("deliveries/fetchDeliveries"),
      store.dispatch("deliveryMaterials/fetchDeliveryMaterials"),
      store.dispatch("employees/fetchEmployees"),
      store.dispatch("measurements/fetchMeasurements"),
      store.dispatch("orders/fetchOrders"),
      store.dispatch("orderServices/fetchOrderServices"),
      store.dispatch("orderMaterials/fetchOrderMaterials"),
      store.dispatch("orderEmployees/fetchOrderEmployees"),
      store.dispatch("orderStatusHistory/fetchOrderStatusHistory"),
    ]);
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
});
</script>

<style scoped>
.data-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.tables-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.table-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style>