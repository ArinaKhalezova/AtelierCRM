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
            :columns="[
              { key: 'client_id', label: 'ID' },
              { key: 'fullname', label: 'ФИО' },
              { key: 'phone_number', label: 'Телефон' },
              { key: 'email', label: 'Email' },
            ]"
          />
        </div>

        <!-- Сотрудники -->
        <div class="table-section">
          <h2>Сотрудники</h2>
          <DataTable
            :data="employeesWithDetails"
            :columns="[
              { key: 'employee_id', label: 'ID' },
              { key: 'fullname', label: 'ФИО' },
              { key: 'position', label: 'Должность' },
              { key: 'phone_number', label: 'Телефон' },
              { key: 'email', label: 'Email' },
            ]"
          />
        </div>

        <!-- Поставщики -->
        <div class="table-section">
          <h2>Поставщики</h2>
          <DataTable
            :data="suppliers"
            :columns="[
              { key: 'supplier_id', label: 'ID' },
              { key: 'org_name', label: 'Организация' },
              { key: 'phone_number', label: 'Телефон' },
              { key: 'address', label: 'Адрес' },
              { key: 'inn', label: 'ИНН' },
            ]"
          />
        </div>

        <!-- Материалы -->
        <div class="table-section">
          <h2>Материалы</h2>
          <DataTable
            :data="materials"
            :columns="[
              { key: 'material_id', label: 'ID' },
              { key: 'material_name', label: 'Название' },
              { key: 'type', label: 'Тип' },
              { key: 'unit', label: 'Единица' },
              { key: 'quantity', label: 'Количество' },
              { key: 'cost_per_unit', label: 'Цена' },
            ]"
          />
        </div>

        <!-- Поставки -->
        <div class="table-section">
          <h2>Поставки</h2>
          <DataTable
            :data="deliveries"
            :columns="[
              { key: 'delivery_id', label: 'ID' },
              { key: 'supplier_id', label: 'ID поставщика' },
              { key: 'delivery_date', label: 'Дата' },
              { key: 'document_path', label: 'Документ' },
            ]"
          />
        </div>

        <!-- Услуги -->
        <div class="table-section">
          <h2>Услуги</h2>
          <DataTable
            :data="services"
            :columns="[
              { key: 'service_id', label: 'ID' },
              { key: 'name', label: 'Название' },
              { key: 'category', label: 'Категория' },
              { key: 'description', label: 'Описание' },
              { key: 'base_cost', label: 'Цена' },
            ]"
          />
        </div>

        <!-- Заказы -->
        <div class="table-section">
          <h2>Заказы</h2>
          <DataTable
            :data="orders"
            :columns="[
              { key: 'order_id', label: 'ID' },
              { key: 'client_id', label: 'ID клиента' },
              { key: 'tracking_number', label: 'Номер' },
              { key: 'status', label: 'Статус' },
              { key: 'total_cost', label: 'Сумма' },
              { key: 'created_at', label: 'Дата создания' },
            ]"
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

// Проверка прав
const isSuperAdmin = computed(() => store.getters["auth/isSuperAdmin"]);

// Получаем данные из хранилища
const clients = computed(() => store.state.clients.clients || []);
const employees = computed(() => store.state.employees.employees || []);
const users = computed(() => store.state.users.users || []);
const suppliers = computed(() => store.state.suppliers.suppliers || []);
const materials = computed(() => store.state.materials.materials || []);
const deliveries = computed(() => store.state.deliveries.deliveries || []);
const services = computed(() => store.state.services.services || []);
const orders = computed(() => store.state.orders.orders || []);

// Комбинируем данные сотрудников с пользователями
const employeesWithDetails = computed(() => {
  return employees.value.map((emp) => {
    const user = users.value.find((u) => u.user_id === emp.user_id) || {};
    return {
      ...emp,
      ...user,
    };
  });
});

// Загрузка данных
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("clients/fetchClients"),
      store.dispatch("employees/fetchEmployees"),
      store.dispatch("users/fetchUsers"),
      store.dispatch("suppliers/fetchSuppliers"),
      store.dispatch("materials/fetchMaterials"),
      store.dispatch("deliveries/fetchDeliveries"),
      store.dispatch("services/fetchServices"),
      store.dispatch("orders/fetchOrders"),
    ]);
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
