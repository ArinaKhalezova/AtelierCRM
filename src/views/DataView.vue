<template>
  <div class="data-view">
    <h1>Данные из базы данных</h1>

    <!-- Таблица клиентов -->
    <div class="data-table">
      <div class="table-header" @click="toggleTable('clients')">
        <h2>Клиенты</h2>
        <span class="toggle-icon">{{ isClientsVisible ? "▼" : "▶" }}</span>
      </div>
      <table v-if="isClientsVisible">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.client_id">
            <td>{{ client.client_id }}</td>
            <td>{{ client.fullname }}</td>
            <td>{{ client.phone_number }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.registration_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Таблица должностей -->
    <div class="data-table">
      <div class="table-header" @click="toggleTable('positions')">
        <h2>Должности</h2>
        <span class="toggle-icon">{{ isPositionsVisible ? "▼" : "▶" }}</span>
      </div>
      <table v-if="isPositionsVisible">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="position in jobPositions" :key="position.job_position_id">
            <td>{{ position.job_position_id }}</td>
            <td>{{ position.position_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Таблица статусов -->
    <div class="data-table">
      <div class="table-header" @click="toggleTable('statuses')">
        <h2>Статусы</h2>
        <span class="toggle-icon">{{ isStatusesVisible ? "▼" : "▶" }}</span>
      </div>
      <table v-if="isStatusesVisible">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="status in statuses" :key="status.status_id">
            <td>{{ status.status_id }}</td>
            <td>{{ status.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Таблица типов материала -->
    <div class="data-table">
      <div class="table-header" @click="toggleTable('materialTypes')">
        <h2>Типы материала</h2>
        <span class="toggle-icon">{{
          isMaterialTypesVisible ? "▼" : "▶"
        }}</span>
      </div>
      <table v-if="isMaterialTypesVisible">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="materialType in materialTypes"
            :key="materialType.material_type_id"
          >
            <td>{{ materialType.material_type_id }}</td>
            <td>{{ materialType.type_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import api from "@/services/api";

const store = useStore();

const clients = ref([]);
const jobPositions = ref([]);
const statuses = ref([]);
const materialTypes = ref([]);

// Состояние видимости таблиц
const isClientsVisible = ref(false);
const isPositionsVisible = ref(false);
const isStatusesVisible = ref(false);
const isMaterialTypesVisible = ref(false);

// Функция для переключения видимости таблиц
const toggleTable = (table) => {
  if (table === "clients") {
    isClientsVisible.value = !isClientsVisible.value;
  } else if (table === "positions") {
    isPositionsVisible.value = !isPositionsVisible.value;
  } else if (table === "statuses") {
    isStatusesVisible.value = !isStatusesVisible.value;
  } else if (table === "materialTypes") {
    isMaterialTypesVisible.value = !isMaterialTypesVisible.value;
  }
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    // Загрузка клиентов
    const clientsResponse = await api.getClients();
    clients.value = clientsResponse.data;

    // Загрузка должностей
    const positionsResponse = await api.getJobPositions();
    jobPositions.value = positionsResponse.data;

    // Загрузка статусов
    const statusesResponse = await api.getStatuses();
    statuses.value = statusesResponse.data;

    // Загрузка типов материала
    const materialTypesResponse = await api.getMaterialTypes();
    materialTypes.value = materialTypesResponse.data;
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
});
</script>

<style scoped>
.data-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.data-table {
  /* margin-bottom: 3rem; */
}

.table-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

h2 {
  margin-bottom: 1rem;
  color: var(--primary-color);
  margin-right: 0.5rem;
}

.toggle-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: var(--primary-color);
  color: white;
}

tr:hover {
  background-color: #f5f5f5;
}
</style>
