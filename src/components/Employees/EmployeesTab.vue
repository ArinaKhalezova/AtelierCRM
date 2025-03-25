<template>
  <div class="employees-tab">
    <div class="header">
      <h2>Сотрудники</h2>
      <button @click="openEmployeeModal" class="add-employee-button">
        <span class="plus-icon">+</span> Добавить сотрудника
      </button>
    </div>

    <div class="table-wrapper">
      <div class="table-container">
        <table class="employee-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Телефон</th>
              <th>Email</th>
              <th class="actions-column">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.employee_id">
              <td data-label="ФИО">{{ employee.fullname }}</td>
              <td data-label="Должность">{{ employee.position }}</td>
              <td data-label="Телефон">{{ employee.phone_number }}</td>
              <td data-label="Email">{{ employee.email || "—" }}</td>
              <td class="actions-column" data-label="Действия">
                <button
                  @click="deleteEmployee(employee.employee_id)"
                  class="delete-button"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно остаётся без изменений -->
    <Modal :isOpen="isEmployeeModalOpen" @close="closeEmployeeModal">
      <h3>Добавить нового сотрудника</h3>
      <form @submit.prevent="addEmployee">
        <div class="form-group">
          <label>ФИО:</label>
          <input v-model="newEmployee.fullname" required />
        </div>
        <div class="form-group">
          <label>Должность:</label>
          <select v-model="newEmployee.position" required>
            <option
              v-for="position in jobPositions"
              :key="position"
              :value="position"
            >
              {{ position }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Телефон:</label>
          <input v-model="newEmployee.phone_number" required />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input v-model="newEmployee.email" type="email" />
        </div>
        <div class="form-group">
          <label>Пароль:</label>
          <input v-model="newEmployee.password" type="password" required />
        </div>
        <button type="submit" class="submit-button">Добавить сотрудника</button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";

const store = useStore();

const isEmployeeModalOpen = ref(false);
const newEmployee = ref({
  fullname: "",
  position: "",
  phone_number: "",
  email: "",
  password: "",
});

const employees = computed(() => store.state.employees.employees);
const jobPositions = computed(() => store.state.employees.jobPositions);
const error = computed(() => store.state.employees.error);

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("employees/fetchEmployees");
  await store.dispatch("employees/fetchJobPositions");
});

const openEmployeeModal = () => {
  isEmployeeModalOpen.value = true;
};

const closeEmployeeModal = () => {
  isEmployeeModalOpen.value = false;
};

const addEmployee = async () => {
  if (
    newEmployee.value.fullname.trim() &&
    newEmployee.value.position &&
    newEmployee.value.phone_number.trim() &&
    newEmployee.value.password.trim()
  ) {
    try {
      await store.dispatch("employees/addEmployeeAction", newEmployee.value);
      newEmployee.value = {
        fullname: "",
        position: "",
        phone_number: "",
        email: "",
        password: "",
      };
      error.value = "";
      closeEmployeeModal();
    } catch (err) {
      error.value = "Ошибка при добавлении сотрудника";
    }
  } else {
    error.value =
      "Заполните обязательные поля: ФИО, должность, телефон и пароль";
  }
};

const deleteEmployee = async (employeeId) => {
  if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
    try {
      await store.dispatch("employees/deleteEmployeeAction", employeeId);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении сотрудника";
    }
  }
};
</script>

<style scoped>
.employees-tab {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

h2 {
  color: var(--dark-teal);
  margin: 0;
  font-size: 1.5rem;
}

.add-employee-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-employee-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

.table-wrapper {
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  width: 100%;
  overflow: auto;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.employee-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.employee-table th,
.employee-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.employee-table th {
  background-color: var(--dark-teal);
  color: white;
  position: sticky;
  top: 0;
  font-weight: 500;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.employee-table tr:last-child td {
  border-bottom: none;
}

.employee-table tr:hover {
  background-color: rgba(139, 170, 173, 0.05);
}

.delete-button {
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.delete-button:hover,
.cancel-button:hover {
  background-color: #c82333;
  opacity: 0.95;
}

/* Стили для модального окна и формы */
.modal-form {
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.modal-form h3 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-teal);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.2);
}

.submit-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

/* Стили для ошибок */
.error-message {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .employees-tab {
    padding: 1rem;
  }

  .employee-table {
    display: block;
    width: 100%;
  }

  .employee-table thead {
    display: none;
  }

  .employee-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .employee-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: none;
    text-align: right;
  }

  .employee-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: var(--dark-teal);
  }

  .actions-column {
    width: 100%;
    justify-content: flex-end;
  }

  .modal-form {
    padding: 1rem;
  }

  .form-group input,
  .form-group select {
    padding: 0.65rem;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-employee-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
