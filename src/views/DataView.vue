<template>
  <div class="data-view">
    <h1>Данные системы</h1>
    <div v-if="loading" class="loading">Загрузка данных...</div>
    <div v-else>
      <div class="tables-container">
        <!-- Клиенты -->
        <div class="table-section">
          <h2>Клиенты</h2>
          <DataTable
            :data="clients"
            :columns="clientColumns"
            :actions="clientActions"
            @action="handleClientAction"
          />
        </div>

        <!-- Сотрудники -->
        <div class="table-section">
          <h2>Сотрудники</h2>
          <DataTable
            :data="employeesWithDetails"
            :columns="employeeColumns"
            :actions="employeeActions"
            @action="handleEmployeeAction"
          />
        </div>

        <!-- Поставщики -->
        <div class="table-section">
          <h2>Поставщики</h2>
          <DataTable
            :data="suppliers"
            :columns="supplierColumns"
            :actions="supplierActions"
            @action="handleSupplierAction"
          />
        </div>

        <!-- Материалы -->
        <div class="table-section">
          <h2>Материалы</h2>
          <DataTable
            :data="materialsWithDetails"
            :columns="materialColumns"
            :actions="materialActions"
            @action="handleMaterialAction"
          />
        </div>

        <!-- Поставки -->
        <div class="table-section">
          <h2>Поставки</h2>
          <DataTable
            :data="deliveriesWithDetails"
            :columns="deliveryColumns"
            :actions="deliveryActions"
            @action="handleDeliveryAction"
          />
        </div>

        <!-- Услуги -->
        <div class="table-section">
          <h2>Услуги</h2>
          <DataTable
            :data="servicesWithDetails"
            :columns="serviceColumns"
            :actions="serviceActions"
            @action="handleServiceAction"
          />
        </div>

        <!-- Заказы -->
        <div class="table-section">
          <h2>Заказы</h2>
          <DataTable
            :data="ordersWithDetails"
            :columns="orderColumns"
            :actions="orderActions"
            @action="handleOrderAction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import DataTable from "@/components/DataView/DataTable.vue";

const store = useStore();
const loading = ref(true);

// Колонки таблиц
const clientColumns = [
  { key: "client_id", label: "ID", sortable: true },
  { key: "fullname", label: "ФИО", sortable: true },
  { key: "phone_number", label: "Телефон", sortable: true },
  { key: "email", label: "Email", sortable: true },
];

const employeeColumns = [
  { key: "employee_id", label: "ID", sortable: true },
  { key: "fullname", label: "ФИО", sortable: true },
  { key: "job_position", label: "Должность", sortable: true },
  { key: "phone_number", label: "Телефон", sortable: true },
  { key: "email", label: "Email", sortable: true },
];

const supplierColumns = [
  { key: "supplier_id", label: "ID", sortable: true },
  { key: "org_name", label: "Название", sortable: true }, // Изменили name на org_name
  { key: "phone_number", label: "Телефон", sortable: true },
  { key: "address", label: "Адрес", sortable: true },
  { key: "inn", label: "ИНН", sortable: true },
];

const materialColumns = [
  { key: "material_id", label: "ID", sortable: true },
  { key: "material_name", label: "Название", sortable: true }, // Было name
  { key: "type", label: "Тип", sortable: true }, // Было type_name
  { key: "unit", label: "Ед. измерения", sortable: true }, // Было unit_name
  { key: "cost_per_unit", label: "Цена", sortable: true }, // Было price
  { key: "quantity", label: "Количество", sortable: true }, // Было quantity_in_stock
];

const deliveryColumns = [
  { key: "delivery_id", label: "ID", sortable: true },
  { key: "delivery_number", label: "Номер поставки", sortable: true },
  { key: "delivery_date", label: "Дата поставки", sortable: true },
  { key: "supplier_id", label: "ID поставщика", sortable: true },
];

const serviceColumns = [
  { key: "service_id", label: "ID", sortable: true },
  { key: "name", label: "Название", sortable: true },
  { key: "category", label: "Категория", sortable: true }, // Было category_name
  { key: "base_cost", label: "Цена", sortable: true }, // Было price
  { key: "description", label: "Описание", sortable: true },
];

const orderColumns = [
  { key: "order_id", label: "ID", sortable: true },
  { key: "tracking_number", label: "Номер заказа", sortable: true },
  { key: "status", label: "Статус", sortable: true },
  { key: "total_cost", label: "Стоимость", sortable: true },
  { key: "deadline_date", label: "Срок выполнения", sortable: true },
  { key: "fitting_date", label: "Дата примерки", sortable: true },
];

const fittingColumns = [
  { key: "fitting_id", label: "ID", sortable: true },
  { key: "order_date", label: "Дата заказа", sortable: true },
  { key: "employee_name", label: "Сотрудник", sortable: true },
  { key: "fitting_date", label: "Дата примерки", sortable: true },
  { key: "notes", label: "Примечания", sortable: true },
];

// Действия для таблиц
const clientActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const employeeActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const supplierActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const materialActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const deliveryActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const serviceActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

const orderActions = [
  { name: "edit", label: "Редактировать", class: "btn-edit" },
  { name: "delete", label: "Удалить", class: "btn-delete" },
];

// Получение данных из хранилища
const clients = computed(() => store.state.clients.clients || []);
const employees = computed(() => store.state.employees.employees || []);
const jobPositions = computed(() => store.state.employees.jobPositions || []);
const suppliers = computed(() => store.state.suppliers.suppliers || []);
const materials = computed(() => store.state.materials.materials || []);
const materialTypes = computed(() => store.state.materials.materialTypes || []);
const materialUnits = computed(() => store.state.materials.materialUnits || []);
const deliveries = computed(() => store.state.deliveries.deliveries || []);
const services = computed(() => store.state.services.services || []);
const serviceCategories = computed(
  () => store.state.services.serviceCategories || []
);
const orders = computed(() => store.state.orders.orders || []);
const fittings = computed(() => store.state.fittings.fittings || []);

// Комбинированные данные для отображения
const employeesWithDetails = computed(() => {
  return employees.value.map((emp) => {
    return {
      ...emp,
      job_position: emp.position || "Не указано", // Используем поле position из БД
    };
  });
});
const materialsWithDetails = computed(() => {
  return materials.value.map((mat) => {
    const type =
      materialTypes.value.find((t) => t.type_id === mat.type_id) || {};
    const unit =
      materialUnits.value.find((u) => u.unit_id === mat.unit_id) || {};
    return {
      ...mat,
      type_name: type.type_name || "Не указано",
      unit_name: unit.unit_name || "Не указано",
    };
  });
});

const deliveriesWithDetails = computed(() => {
  return deliveries.value.map((del) => {
    const supplier =
      suppliers.value.find((s) => s.supplier_id === del.supplier_id) || {};
    const material =
      materials.value.find((m) => m.material_id === del.material_id) || {};
    return {
      ...del,
      supplier_name: supplier.name || "Не указано",
      material_name: material.name || "Не указано",
    };
  });
});

const servicesWithDetails = computed(() => {
  return services.value.map((serv) => {
    const category =
      serviceCategories.value.find((c) => c.category_id === serv.category_id) ||
      {};
    return {
      ...serv,
      category_name: category.name || "Не указано",
    };
  });
});

const ordersWithDetails = computed(() => {
  return orders.value.map((order) => {
    const client =
      clients.value.find((c) => c.client_id === order.client_id) || {};
    const service =
      services.value.find((s) => s.service_id === order.service_id) || {};
    const employee =
      employees.value.find((e) => e.employee_id === order.employee_id) || {};
    return {
      ...order,
      client_name: client.fullname || "Не указано",
      service_name: service.name || "Не указано",
      employee_name: employee.fullname || "Не указано",
    };
  });
});

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("clients/fetchClients"),
      store.dispatch("employees/fetchEmployees"),
      store.dispatch("employees/fetchJobPositions"),
      store.dispatch("suppliers/fetchSuppliers"),
      store.dispatch("materials/fetchMaterials"),
      store.dispatch("materials/fetchMaterialTypes"),
      store.dispatch("materials/fetchMaterialUnits"),
      store.dispatch("deliveries/fetchDeliveries"),
      store.dispatch("services/fetchServices"),
      store.dispatch("services/fetchServiceCategories"),
      store.dispatch("orders/fetchOrders"),
    ]);

    console.log("Данные загружены:", {
      clients: clients.value,
      suppliers: suppliers.value,
      materials: materials.value,
      deliveries: deliveries.value,
      services: services.value,
      orders: orders.value,
    });
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.data-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
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
  overflow-x: auto;
}

.table-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.3rem;
}
</style>
