<template>
  <div class="employees-tab">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="header">
      <h2>Сотрудники</h2>
      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Поиск сотрудников..." />
        </div>
        <button
          @click="openModal"
          class="add-employee-button"
          v-if="isSuperAdmin"
        >
          + Добавить сотрудника
        </button>
      </div>
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
              <!-- <th v-if="isSuperAdmin">Пароль</th> -->
              <th class="actions-column">Действия</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="employee in filteredEmployees"
              :key="employee.employee_id"
            >
              <td data-label="ФИО">{{ employee.fullname }}</td>
              <td data-label="Должность">{{ employee.position }}</td>
              <td data-label="Телефон">{{ employee.phone_number }}</td>
              <td data-label="Email">{{ employee.email || "—" }}</td>
              <!-- <td v-if="isSuperAdmin">
                {{ employee.password_hash || "••••••" }}
              </td> -->
              <td class="actions-column" data-label="Действия">
                <template v-if="isSuperAdmin">
                  <button @click="openModal(employee)" class="edit-button">
                    Редактировать
                  </button>
                  <button
                    @click="deleteEmployee(employee.employee_id)"
                    class="delete-button"
                  >
                    Удалить
                  </button>
                </template>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Единое модальное окно -->
    <Modal :isOpen="isModalOpen" @close="closeModal">
      <div class="modal-form">
        <h3>{{ isEditing ? "Редактирование" : "Добавление" }} сотрудника</h3>

        <div v-if="formErrors._general" class="form-error">
          {{ formErrors._general }}
        </div>

        <form @submit.prevent="saveEmployee">
          <div class="form-group" :class="{ 'has-error': formErrors.fullname }">
            <label>ФИО:</label>
            <input
              v-model="formData.fullname"
              required
              placeholder="Иванов Иван Иванович"
              @input="clearError('fullname')"
            />
            <span v-if="formErrors.fullname" class="field-error">
              {{ formErrors.fullname }}
            </span>
            <div class="hint">Минимум 2 символа, только буквы и дефисы</div>
          </div>

          <div class="form-group" :class="{ 'has-error': formErrors.position }">
            <label>Должность:</label>
            <select
              v-model="formData.position"
              required
              @change="clearError('position')"
            >
              <option value="">Выберите должность</option>
              <option
                v-for="position in jobPositions"
                :key="position"
                :value="position"
              >
                {{ position }}
              </option>
            </select>
            <span v-if="formErrors.position" class="field-error">
              {{ formErrors.position }}
            </span>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': formErrors.phone_number }"
          >
            <label>Телефон:</label>
            <input
              v-model="formData.phone_number"
              placeholder="+7XXXXXXXXXX или 8XXXXXXXXXX"
              required
              @input="clearError('phone_number')"
            />
            <span v-if="formErrors.phone_number" class="field-error">
              {{ formErrors.phone_number }}
            </span>
            <div class="hint">Формат: +7XXXXXXXXXX или 8XXXXXXXXXX</div>
          </div>

          <div class="form-group" :class="{ 'has-error': formErrors.email }">
            <label>Email:</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="example@mail.com"
              @input="clearError('email')"
            />
            <span v-if="formErrors.email" class="field-error">
              {{ formErrors.email }}
            </span>
          </div>

          <div
            v-if="!isEditing"
            class="form-group"
            :class="{ 'has-error': formErrors.password }"
          >
            <label>Пароль:</label>
            <input
              v-model="formData.password"
              type="password"
              required
              placeholder="Не менее 6 символов"
              @input="clearError('password')"
            />
            <span v-if="formErrors.password" class="field-error">
              {{ formErrors.password }}
            </span>
            <div class="hint">Минимум 6 символов</div>
          </div>

          <button type="submit" class="submit-button">
            {{ isEditing ? "Сохранить изменения" : "Добавить сотрудника" }}
          </button>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";

const store = useStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const searchQuery = ref("");
const formData = ref({
  fullname: "",
  position: "",
  phone_number: "",
  email: "",
  password: "",
});
const formErrors = ref({});

const employees = computed(() => store.state.employees.employees);
const jobPositions = computed(() => store.state.employees.jobPositions);
const error = computed(() => store.state.employees.error);

const isSuperAdmin = computed(() => store.getters["auth/isSuperAdmin"]);

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value;

  const query = searchQuery.value.toLowerCase();
  return store.state.employees.employees.filter((employee) => {
    return Object.values(employee).some((value) =>
      String(value).toLowerCase().includes(query)
    );
  });
});

const openModal = (employee = null) => {
  isEditing.value = !!employee;

  if (employee) {
    formData.value = {
      ...employee,
      password: "", // Пароль не хранится для редактирования
    };
  } else {
    formData.value = {
      fullname: "",
      position: "",
      phone_number: "",
      email: "",
      password: "",
    };
  }

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {};
  formErrors.value = {}; // Сбрасываем ошибки при закрытии
  store.commit("employees/SET_ERROR", null); // Сбрасываем глобальную ошибку
};

const saveEmployee = async () => {
  formErrors.value = {};

  try {
    const action = isEditing.value
      ? "employees/updateEmployeeAction"
      : "employees/addEmployeeAction";

    const payload = isEditing.value
      ? {
          id: formData.value.employee_id,
          employeeData: formData.value,
        }
      : formData.value;

    const result = await store.dispatch(action, payload);

    if (result.success) {
      await store.dispatch("employees/fetchEmployees");
      closeModal();
    } else {
      formErrors.value = result.errors || {};
    }
  } catch (err) {
    console.error("Ошибка сохранения сотрудника:", err);
  }
};

const deleteEmployee = async (employeeId) => {
  if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
    try {
      await store.dispatch("employees/deleteEmployeeAction", employeeId);
      store.commit("employees/SET_ERROR", ""); // Используем мутацию
    } catch (err) {
      store.commit("employees/SET_ERROR", "Ошибка при удалении сотрудника"); // Используем мутацию
    }
  }
};

const clearError = (field) => {
  if (formErrors.value[field]) {
    formErrors.value = { ...formErrors.value, [field]: "" };
  }
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("employees/fetchEmployees");
  await store.dispatch("employees/fetchJobPositions");
});
</script>

<style scoped>
.error-message {
  color: #d32f2f;
  background-color: #fde8e8;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.form-error {
  color: #d32f2f;
  margin-bottom: 16px;
  font-size: 0.9em;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.has-error input,
.form-group.has-error select {
  border-color: #d32f2f;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8em;
  display: block;
  margin-top: 4px;
}

.hint {
  color: #666;
  font-size: 0.8em;
  margin-top: 4px;
}

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

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 0.6rem 1.2rem 0.6rem 2rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
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
  white-space: nowrap;
  width: 1%;
}

.employee-table tr:last-child td {
  border-bottom: none;
}

.employee-table tr:hover {
  background-color: rgba(139, 170, 173, 0.05);
}

.edit-button {
  background-color: var(--teal);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background-color: #7a9b9e;
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
