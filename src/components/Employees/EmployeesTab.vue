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
          @click="openModal()"
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
              <th class="actions-column" v-if="isSuperAdmin">Действия</th>
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
              <td class="actions-column" data-label="Действия">
                <template v-if="isSuperAdmin">
                  <button @click="openModal(employee)" class="edit-button">
                    Редактировать
                  </button>
                  <button
                    @click="openPasswordModal(employee)"
                    class="password-button"
                  >
                    Сменить пароль
                  </button>
                  <button
                    @click="confirmDelete(employee.employee_id)"
                    class="delete-button"
                  >
                    Удалить
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно редактирования/добавления -->
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

    <!-- Модальное окно смены пароля -->
    <Modal :isOpen="isPasswordModalOpen" @close="closePasswordModal">
      <div class="modal-form">
        <h3>Смена пароля для {{ selectedEmployee?.fullname }}</h3>
        <div v-if="passwordError" class="form-error">
          {{ passwordError }}
        </div>
        <form @submit.prevent="confirmPasswordChange">
          <div class="form-group">
            <label>Новый пароль:</label>
            <input
              v-model="newPassword"
              type="password"
              required
              placeholder="Не менее 6 символов"
              @input="validatePassword"
            />
            <div
              class="hint"
              :class="{ 'error-hint': passwordError.details?.password }"
            >
              {{ passwordError.details?.password || "Минимум 6 символов" }}
            </div>
          </div>
          <div class="form-group">
            <label>Подтвердите новый пароль:</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              placeholder="Повторите пароль"
              @input="validatePassword"
            />
            <div
              class="hint"
              v-if="newPassword && newPassword !== confirmPassword"
            >
              Пароли не совпадают
            </div>
          </div>
          <div class="form-actions">
            <button
              type="button"
              @click="closePasswordModal"
              class="cancel-button"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="!isPasswordValid"
            >
              Сохранить пароль
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Модальное окно подтверждения -->
    <Modal :isOpen="isConfirmModalOpen" @close="closeConfirmModal">
      <div class="confirmation-modal">
        <h3>Подтверждение</h3>
        <p>{{ confirmMessage }}</p>
        <div class="confirmation-buttons">
          <button @click="executePendingAction" class="confirm-button">
            Да
          </button>
          <button @click="closeConfirmModal" class="cancel-button">Нет</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";

const store = useStore();

// Состояния для таблицы
const searchQuery = ref("");
const error = computed(() => store.state.employees.error);
const employees = computed(() => store.state.employees.employees);
const jobPositions = computed(() => store.state.employees.jobPositions);
const isSuperAdmin = computed(() => store.getters["auth/isSuperAdmin"]);

// Состояния для модалок
const isModalOpen = ref(false);
const isEditing = ref(false);
const formData = ref({
  fullname: "",
  position: "",
  phone_number: "",
  email: "",
  password: "",
});
const formErrors = ref({});

const isPasswordModalOpen = ref(false);
const selectedEmployee = ref(null);
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");

const isConfirmModalOpen = ref(false);
const confirmMessage = ref("");
const pendingAction = ref(null);

// Фильтрация сотрудников
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value;
  const query = searchQuery.value.toLowerCase();
  return employees.value.filter((employee) =>
    Object.values(employee).some((value) =>
      String(value).toLowerCase().includes(query)
    )
  );
});

// Методы для работы с сотрудниками
const openModal = (employee = null) => {
  console.log("isEditing will be:", !!employee);
  isEditing.value = !!employee;
  formData.value = employee
    ? { ...employee, password: "" }
    : { fullname: "", position: "", phone_number: "", email: "", password: "" };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {};
  formErrors.value = {};
  isEditing.value = false;
};

const saveEmployee = async () => {
  formErrors.value = {};
  try {
    const payload = {
      fullname: formData.value.fullname,
      phone_number: formData.value.phone_number,
      email: formData.value.email,
      position: formData.value.position,
    };

    const action = isEditing.value
      ? "employees/updateEmployeeAction"
      : "employees/addEmployeeAction";

    const result = await store.dispatch(
      action,
      isEditing.value
        ? { id: formData.value.employee_id, employeeData: payload }
        : { ...payload, password: formData.value.password }
    );

    if (result.success) {
      await store.dispatch("employees/fetchEmployees");
      closeModal();
    } else {
      formErrors.value = result.errors || {};
    }
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    formErrors.value._general = err.response?.data?.message || "Ошибка сервера";
  }
};

// Методы для смены пароля
const validatePassword = () => {
  if (newPassword.value.length < 6) {
    passwordError.value = "Пароль должен содержать минимум 6 символов";
  } else if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Пароли не совпадают";
  } else {
    passwordError.value = ""; // Очищаем ошибку, если всё правильно
  }
};

const isPasswordValid = computed(() => {
  return (
    newPassword.value.length >= 6 && newPassword.value === confirmPassword.value
  );
});

const openPasswordModal = (employee) => {
  selectedEmployee.value = employee;
  newPassword.value = "";
  confirmPassword.value = "";
  passwordError.value = "";
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
};

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Пароли не совпадают";
    return;
  }

  if (newPassword.value.length < 6) {
    passwordError.value = "Пароль должен содержать минимум 6 символов";
    return;
  }

  try {
    const result = await store.dispatch("employees/changePassword", {
      employeeId: selectedEmployee.value.employee_id,
      newPassword: newPassword.value,
    });

    if (result.success) {
      closePasswordModal();
      showConfirmation("Пароль успешно изменен");
    } else {
      passwordError.value = result.message;
    }
  } catch (error) {
    passwordError.value = "Ошибка при изменении пароля";
  }
};

// Методы подтверждения действий
const showConfirmation = (message, action = null) => {
  confirmMessage.value = message;
  pendingAction.value = action;
  isConfirmModalOpen.value = true;
};

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
  pendingAction.value = null;
};

const executePendingAction = () => {
  if (pendingAction.value) pendingAction.value();
  closeConfirmModal();
};

const confirmPasswordChange = () => {
  showConfirmation(
    "Вы уверены, что хотите изменить пароль этого сотрудника?",
    changePassword
  );
};

const confirmDelete = (employeeId) => {
  showConfirmation(
    "Вы уверены, что хотите удалить этого сотрудника?",
    async () => {
      try {
        await store.dispatch("employees/deleteEmployeeAction", employeeId);
      } catch (err) {
        store.commit("employees/SET_ERROR", "Ошибка при удалении сотрудника");
      }
    }
  );
};

const clearError = (field) => {
  if (formErrors.value[field]) {
    delete formErrors.value[field];
    formErrors.value = { ...formErrors.value };
  }
};

// Загрузка данных
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

.error-hint {
  color: #f44336;
}

.password-button {
  background-color: var(--warning);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.password-button:hover {
  background-color: #e0a800;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  background-color: var(--danger);
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

.confirmation-modal {
  padding: 1.5rem;
  text-align: center;
}

.confirmation-modal h3 {
  color: var(--dark-teal);
  margin-bottom: 1rem;
}

.confirmation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  align-items: center;
}

.confirm-button {
  background-color: var(--success);
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

.confirm-button:hover {
  background-color: var(--dark-success);
}

.password-help {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
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
  align-items: start;
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
  background-color: var(--success);
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
  background-color: var(--dark-success);
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
  background-color: var(--info);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background-color: var(--dark-info);
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

.modal-form {
  padding: 1.5rem;
  width: 100%;
  margin: 0 auto;
}

.modal-form h3 {
  color: var(--dark-teal);
  margin-bottom: ;
  text-align: center;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
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
  background-color: var(--success);
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
  background-color: var(--dark-success);
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
