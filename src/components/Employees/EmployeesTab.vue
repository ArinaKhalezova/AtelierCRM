<template>
  <div class="employees-tab">
    <h2>Сотрудники</h2>
    <button @click="openEmployeeModal" class="add-employee-button">
      Добавить сотрудника
    </button>

    <div class="employee-list">
      <div v-for="employee in employees" :key="employee.employee_id" class="employee-item">
        <p><strong>ФИО:</strong> {{ employee.fullname }}</p>
        <p><strong>Должность:</strong> {{ employee.position }}</p>
        <p><strong>Телефон:</strong> {{ employee.phone_number }}</p>
        <p><strong>Email:</strong> {{ employee.email || "Не указан" }}</p>
        <button @click="deleteEmployee(employee.employee_id)" class="delete-button">
          Удалить
        </button>
      </div>
    </div>

    <!-- Модальное окно для добавления сотрудника -->
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
            <option v-for="position in jobPositions" :key="position" :value="position">
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
        <button type="submit">Добавить сотрудника</button>
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
      newEmployee.value = { fullname: "", position: "", phone_number: "", email: "", password: "" };
      error.value = "";
      closeEmployeeModal();
    } catch (err) {
      error.value = "Ошибка при добавлении сотрудника";
    }
  } else {
    error.value = "Заполните обязательные поля: ФИО, должность, телефон и пароль";
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