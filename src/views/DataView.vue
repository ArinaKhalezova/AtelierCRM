<template>
  <div class="data-view">
    <h1>Данные из базы данных</h1>

    <!-- Таблица клиентов -->
    <div class="data-table">
      <h2>Клиенты</h2>
      <table>
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
      <h2>Должности</h2>
      <table>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import api from "@/services/api";

const store = useStore();

const clients = ref([]);
const jobPositions = ref([]);

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    // Загрузка клиентов
    const clientsResponse = await api.getClients();
    clients.value = clientsResponse.data;

    // Загрузка должностей
    const positionsResponse = await api.getJobPositions();
    jobPositions.value = positionsResponse.data;
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
  margin-bottom: 3rem;
}

h2 {
  margin-bottom: 1rem;
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