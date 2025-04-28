<template>
  <div class="workload-section">
    <h2>Загруженность сотрудников</h2>
    <div v-if="loading" class="loading">Загрузка данных...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="workload-container">
      <div class="workload-header">
        <div class="header-name">Сотрудник</div>
        <div class="header-position">Должность</div>
        <div class="header-workload">В работе</div>
        <div class="header-deadline">Ближайший срок</div>
        <div class="header-capacity">Загруженность</div>
      </div>

      <div
        v-for="employee in employees"
        :key="employee.employee_id"
        class="workload-row"
      >
        <div class="employee-name">{{ employee.fullname }}</div>
        <div class="employee-position">{{ employee.position }}</div>
        <div class="employee-count">{{ employee.active_orders_count }}</div>
        <div class="employee-deadline">
          {{ formatDeadline(employee.nearest_deadline) }}
        </div>
        <div class="employee-bar">
          <div
            class="capacity-bar"
            :style="{ width: `${getCapacityPercent(employee)}%` }"
            :class="getCapacityClass(employee)"
          ></div>
          <span class="capacity-text">{{ getCapacityPercent(employee) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const loading = ref(true);
const error = ref(null);
const employees = ref([]);

const MAX_CAPACITY = 5; // Максимальное количество заказов на сотрудника

const fetchData = async () => {
  try {
    loading.value = true;
    const data = await store.dispatch("orderDetails/fetchEmployeesWorkload");
    employees.value = data;
  } catch (e) {
    error.value = "Ошибка загрузки данных о загруженности";
    console.error("EmployeeWorkload error:", e);
  } finally {
    loading.value = false;
  }
};

const formatDeadline = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

const getCapacityPercent = (employee) => {
  return Math.min(
    Math.round((employee.active_orders_count / MAX_CAPACITY) * 100),
    100
  );
};

const getCapacityClass = (employee) => {
  const percent = getCapacityPercent(employee);
  if (percent >= 80) return "high";
  if (percent >= 50) return "medium";
  return "low";
};

onMounted(fetchData);
</script>

<style scoped>
.workload-section {
  margin-top: 3rem;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.workload-section h2 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
}

.workload-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.workload-header,
.workload-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 0.8fr 1.2fr 2fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  align-items: center;
}

.workload-header {
  font-weight: 600;
  color: var(--dark-teal);
  border-bottom: 1px solid var(--light-gray);
}

.workload-row {
  transition: background-color 0.2s;
}

.workload-row:hover {
  background-color: rgba(139, 170, 173, 0.05);
}

.employee-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.capacity-bar {
  height: 1rem;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.capacity-bar.low {
  background-color: var(--success);
}

.capacity-bar.medium {
  background-color: var(--warning);
}

.capacity-bar.high {
  background-color: var(--danger);
}

.capacity-text {
  font-size: 0.9rem;
  color: var(--warm-gray);
}

.loading,
.error {
  padding: 1rem;
  text-align: center;
  color: var(--warm-gray);
}

.error {
  color: var(--danger);
}

@media (max-width: 768px) {
  .workload-header,
  .workload-row {
    grid-template-columns: 1.5fr 1fr 0.8fr 1.5fr;
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .capacity-text {
    display: none;
  }
}
</style>
