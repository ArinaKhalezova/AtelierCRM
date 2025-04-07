<template>
  <div class="order-employees-container">
    <div class="order-employees">
      <h3>Назначенные сотрудники</h3>

      <div v-if="employeeAssignmentError" class="error">
        {{ employeeAssignmentError }}
      </div>

      <div v-if="isEmployeeAssignmentLoading" class="loading">
        Загрузка данных о сотрудниках...
      </div>

      <div v-else>
        <div v-if="employees.length === 0" class="no-employees">
          На заказ пока не назначены сотрудники
        </div>

        <ul v-else class="employees-list">
          <li
            v-for="employee in employees"
            :key="employee.employee_id"
            class="employee-item"
          >
            <span class="employee-name">{{ employee.fullname }}</span>
            <span class="employee-position">({{ employee.position }})</span>
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
          <select
            v-model="selectedEmployeeId"
            class="employee-select"
            :disabled="isEmployeeAssignmentLoading"
          >
            <option value="">Выберите сотрудника</option>
            <option
              v-for="employee in allEmployees"
              :key="employee.employee_id"
              :value="employee.employee_id"
              :disabled="
                employees.some((e) => e.employee_id === employee.employee_id)
              "
            >
              {{ employee.fullname }} ({{ employee.position }})
            </option>
          </select>

          <button
            @click="assignEmployee"
            class="btn assign-btn"
            :disabled="!selectedEmployeeId || isEmployeeAssignmentLoading"
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
const initialLoading = ref(true);

const employees = computed(
  () => store.getters["orderDetails/assignedEmployees"] || []
);
const allEmployees = computed(
  () => store.getters["employees/allEmployees"] || []
);
const isEmployeeAssignmentLoading = computed(
  () =>
    store.getters["orderDetails/isEmployeeAssignmentLoading"] ||
    initialLoading.value
);
const employeeAssignmentError = computed(
  () => store.getters["orderDetails/employeeAssignmentError"]
);

const assignEmployee = async () => {
  if (!selectedEmployeeId.value) return;

  try {
    await store.dispatch("orderDetails/assignEmployeeToOrder", {
      orderId: props.orderId,
      employeeId: selectedEmployeeId.value,
    });
    selectedEmployeeId.value = "";
    await store.dispatch("orderDetails/fetchOrderEmployees", props.orderId);
  } catch (error) {
    console.error("Error assigning employee:", error);
    if (error.response?.status === 403) {
      store.commit(
        "orderDetails/SET_EMPLOYEE_ASSIGNMENT_ERROR",
        "Недостаточно прав"
      );
    }
  }
};

const removeEmployee = async (employeeId) => {
  if (confirm("Убрать этого сотрудника с заказа?")) {
    try {
      await store.dispatch("orderDetails/removeEmployeeFromOrder", {
        orderId: props.orderId,
        employeeId,
      });
      await store.dispatch("orderDetails/fetchOrderEmployees", props.orderId);
    } catch (error) {
      console.error("Error removing employee:", error);
      if (error.response?.status === 403) {
        store.commit(
          "orderDetails/SET_EMPLOYEE_ASSIGNMENT_ERROR",
          "Недостаточно прав"
        );
      }
    }
  }
};

// Загружаем данные при монтировании
onMounted(async () => {
  try {
    // Загружаем параллельно оба набора данных
    await Promise.all([
      store.dispatch("employees/fetchEmployees"),
      store.dispatch("orderDetails/fetchOrderEmployees", props.orderId),
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    initialLoading.value = false;
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
  gap: 0.75rem;
  margin-top: 1.5rem;
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
