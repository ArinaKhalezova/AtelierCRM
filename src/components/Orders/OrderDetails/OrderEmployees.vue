<template>
  <div class="order-employees-container">
    <div class="order-employees">
      <h3>Назначенные сотрудники</h3>

      <div v-if="employeeAssignmentError" class="error">
        {{ employeeAssignmentError }}
      </div>

      <div v-if="isLoading" class="loading">
        Загрузка данных о сотрудниках...
      </div>

      <div v-else>
        <div v-if="assignedEmployees.length === 0" class="no-employees">
          На заказ пока не назначены сотрудники
        </div>

        <ul v-else class="employees-list">
          <li
            v-for="employee in assignedEmployees"
            :key="employee.employee_id"
            class="employee-item"
          >
            <span class="employee-name">{{ employee.fullname }}</span>
            <span class="employee-position">({{ employee.position }})</span>
            <span class="employee-workload">
              {{ getEmployeeWorkload(employee.employee_id) }}/5 заказов
            </span>
            <button
              v-if="canEdit"
              @click="removeEmployee(employee.employee_id)"
              class="btn remove-btn"
              title="Убрать с заказа"
            >
              &times;
            </button>
          </li>
        </ul>

        <div v-if="canEdit" class="assign-form">
          <div class="workload-hint">
            * Сотрудники отсортированы по загруженности (от наименее загруженных)
          </div>
          
          <select
            v-model="selectedEmployeeId"
            class="employee-select"
            :disabled="isAssigning"
          >
            <option value="">Выберите сотрудника</option>
            <option
              v-for="employee in sortedAvailableEmployees"
              :key="employee.employee_id"
              :value="employee.employee_id"
              :disabled="isEmployeeAssigned(employee.employee_id) || isEmployeeOverloaded(employee.employee_id)"
            >
              {{ employee.fullname }} ({{ employee.position }}) - 
              {{ getEmployeeWorkload(employee.employee_id) }}/5 заказов
            </option>
          </select>

          <button
            @click="assignEmployee"
            class="btn assign-btn"
            :disabled="!selectedEmployeeId || isAssigning"
          >
            Назначить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const selectedEmployeeId = ref("");
const isLoading = ref(true);
const isAssigning = ref(false);

// Получаем данные из хранилища
const allEmployees = computed(() => store.getters["employees/allEmployees"]);
const assignedEmployees = computed(
  () => store.getters["orderDetails/assignedEmployees"] || []
);
const employeeAssignmentError = computed(
  () => store.getters["orderDetails/employeeAssignmentError"]
);

// Получаем загруженность сотрудников
const employeesWorkload = ref({});

// Сортируем сотрудников по загруженности
const sortedAvailableEmployees = computed(() => {
  return [...allEmployees.value].sort((a, b) => {
    const aWorkload = getEmployeeWorkload(a.employee_id);
    const bWorkload = getEmployeeWorkload(b.employee_id);
    return aWorkload - bWorkload;
  });
});

// Проверяем, назначен ли уже сотрудник на этот заказ
const isEmployeeAssigned = (employeeId) => {
  return assignedEmployees.value.some(e => e.employee_id === employeeId);
};

// Проверяем, перегружен ли сотрудник
const isEmployeeOverloaded = (employeeId) => {
  return getEmployeeWorkload(employeeId) >= 5;
};

// Получаем количество активных заказов сотрудника
const getEmployeeWorkload = (employeeId) => {
  return employeesWorkload.value[employeeId] || 0;
};

// Назначаем сотрудника
const assignEmployee = async () => {
  if (!selectedEmployeeId.value) return;

  isAssigning.value = true;
  try {
    await store.dispatch("orderDetails/assignEmployeeToOrder", {
      orderId: props.orderId,
      employeeId: selectedEmployeeId.value,
    });
    selectedEmployeeId.value = "";
    await store.dispatch("orderDetails/fetchOrderEmployees", props.orderId);
    await fetchEmployeesWorkload(); // Обновляем загруженность после назначения
  } catch (error) {
    console.error("Error assigning employee:", error);
  } finally {
    isAssigning.value = false;
  }
};

// Удаляем сотрудника с заказа
const removeEmployee = async (employeeId) => {
  if (confirm("Убрать этого сотрудника с заказа?")) {
    try {
      await store.dispatch("orderDetails/removeEmployeeFromOrder", {
        orderId: props.orderId,
        employeeId,
      });
      await store.dispatch("orderDetails/fetchOrderEmployees", props.orderId);
      await fetchEmployeesWorkload(); // Обновляем загруженность после удаления
    } catch (error) {
      console.error("Error removing employee:", error);
    }
  }
};

// Загружаем загруженность сотрудников
const fetchEmployeesWorkload = async () => {
  try {
    const response = await store.dispatch("orderDetails/fetchEmployeesWorkload");
    // Преобразуем массив в объект для быстрого доступа
    const workloadMap = {};
    response.forEach(emp => {
      workloadMap[emp.employee_id] = emp.active_orders_count;
    });
    employeesWorkload.value = workloadMap;
  } catch (error) {
    console.error("Error fetching employees workload:", error);
  }
};

// Загружаем данные при монтировании
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("employees/fetchEmployees"),
      store.dispatch("orderDetails/fetchOrderEmployees", props.orderId),
      fetchEmployeesWorkload()
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.order-employees-container {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-employees {
  padding: 1rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.employees-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.employee-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.employee-item:last-child {
  border-bottom: none;
}

.employee-name {
  flex: 1;
  font-weight: 500;
}

.employee-position {
  color: #666;
  margin: 0 1rem;
  font-size: 0.9rem;
}

.employee-workload {
  color: #666;
  font-size: 0.9rem;
  min-width: 80px;
  text-align: right;
  margin-right: 1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #a71d2a;
}

.assign-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.workload-hint {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.employee-select {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.employee-select:focus {
  outline: none;
  border-color: #20c997;
}

.assign-btn {
  padding: 0.6rem 1.25rem;
  background-color: #20c997;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.assign-btn:hover:not(:disabled) {
  background-color: #199d7a;
}

.assign-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.loading {
  color: #6c757d;
  font-style: italic;
  padding: 0.5rem;
}

.no-employees {
  color: #6c757d;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-style: italic;
}
</style>