<template>
  <div class="suppliers-tab">
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="header">
      <h2>Поставщики</h2>
      <button @click="openSupplierModal" class="add-button">
        <span class="plus-icon">+</span> Добавить поставщика
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="table-wrapper">
      <table class="suppliers-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Телефон</th>
            <th>Адрес</th>
            <th>ИНН</th>
            <th class="actions-column">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in suppliers" :key="supplier.supplier_id">
            <td>{{ supplier.org_name }}</td>
            <td>{{ supplier.phone_number }}</td>
            <td>{{ supplier.address }}</td>
            <td>{{ supplier.inn }}</td>
            <td class="actions-column">
              <button @click="openEditModal(supplier)" class="edit-button">
                Редактировать
              </button>
              <button
                @click="deleteSupplier(supplier.supplier_id)"
                class="delete-button"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :isOpen="isSupplierModalOpen" @close="closeSupplierModal">
      <div class="modal-form">
        <h3>
          {{ editingSupplier ? "Редактирование" : "Добавление" }} поставщика
        </h3>

        <!-- Общая ошибка формы -->
        <div v-if="formErrors._general" class="form-error">
          {{ formErrors._general }}
        </div>

        <form @submit.prevent="saveSupplier">
          <div class="form-group" :class="{ 'has-error': formErrors.org_name }">
            <label>Название организации:</label>
            <input v-model="newSupplier.org_name" required />
            <span v-if="formErrors.org_name" class="field-error">
              {{ formErrors.org_name }}
            </span>
            <div class="hint">От 2 до 100 символов</div>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': formErrors.phone_number }"
          >
            <label>Телефон:</label>
            <input
              v-model="newSupplier.phone_number"
              placeholder="+7XXXXXXXXXX или 8XXXXXXXXXX"
              required
            />
            <span v-if="formErrors.phone_number" class="field-error">
              {{ formErrors.phone_number }}
            </span>
            <div class="hint">Формат: +7XXXXXXXXXX или 8XXXXXXXXXX</div>
          </div>

          <div class="form-group" :class="{ 'has-error': formErrors.address }">
            <label>Адрес:</label>
            <input v-model="newSupplier.address" required />
            <span v-if="formErrors.address" class="field-error">
              {{ formErrors.address }}
            </span>
            <div class="hint">Минимум 5 символов</div>
          </div>

          <div class="form-group" :class="{ 'has-error': formErrors.inn }">
            <label>ИНН:</label>
            <input
              v-model="newSupplier.inn"
              placeholder="10 или 12 цифр"
              required
              maxlength="12"
            />
            <span v-if="formErrors.inn" class="field-error">
              {{ formErrors.inn }}
            </span>
            <div class="hint">Только цифры, 10 или 12 символов</div>
          </div>

          <button type="submit" class="submit-button">
            {{ editingSupplier ? "Сохранить" : "Добавить" }}
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

const formErrors = ref({});
const isSupplierModalOpen = ref(false);
const editingSupplier = ref(null);
const newSupplier = ref({
  org_name: "",
  phone_number: "",
  address: "",
  inn: "",
});

// Computed
const error = computed(() => store.state.suppliers.error);
const suppliers = computed(() => store.state.suppliers.suppliers);

// методы
const openSupplierModal = () => {
  isSupplierModalOpen.value = true;
};

const openEditModal = (supplier) => {
  editingSupplier.value = supplier;
  newSupplier.value = { ...supplier };
  isSupplierModalOpen.value = true;
};

const closeSupplierModal = () => {
  isSupplierModalOpen.value = false;
  editingSupplier.value = null;
  newSupplier.value = {
    org_name: "",
    phone_number: "",
    address: "",
    inn: "",
  };
  formErrors.value = {};
  store.commit("suppliers/SET_ERROR", null);
};

const saveSupplier = async () => {
  formErrors.value = {};

  try {
    const action = editingSupplier.value
      ? "suppliers/updateSupplierAction"
      : "suppliers/addSupplierAction";

    const payload = editingSupplier.value
      ? {
          id: editingSupplier.value.supplier_id,
          supplierData: newSupplier.value,
        }
      : newSupplier.value;

    const result = await store.dispatch(action, payload);

    if (result.success) {
      await store.dispatch("suppliers/fetchSuppliers");
      closeSupplierModal();
    } else {
      formErrors.value = result.errors || {};
    }
  } catch (err) {
    console.error("Ошибка сохранения поставщика:", err);
  }
};

const deleteSupplier = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить этого поставщика?")) return;

  try {
    await store.dispatch("suppliers/deleteSupplierAction", id);
    await store.dispatch("suppliers/fetchSuppliers"); // Обновляем список
  } catch (err) {
    console.error("Delete supplier error:", err);

    let errorMessage = "Ошибка при удалении поставщика";
    if (err.response?.status === 400) {
      errorMessage =
        err.response.data.error ||
        "Нельзя удалить поставщика с существующими поставками";
    } else if (err.response?.status === 404) {
      errorMessage = "Поставщик не найден";
    }

    store.commit("suppliers/SET_ERROR", errorMessage);
  }
};

onMounted(async () => {
  try {
    await store.dispatch("suppliers/fetchSuppliers");
  } catch (err) {
    console.error("Fetch suppliers error:", err);
  }
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

.suppliers-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.suppliers-table th,
.suppliers-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.suppliers-table th {
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

.suppliers-table tr:hover {
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
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #c82333;
  opacity: 0.95;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
}

.modal-form {
  padding: 1.5rem;
}

.modal-form h3 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-teal);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
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
}

.submit-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

@media (max-width: 768px) {
  .suppliers-table {
    display: block;
    width: 100%;
  }

  .suppliers-table thead {
    display: none;
  }

  .suppliers-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .suppliers-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: none;
  }

  .suppliers-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: var(--dark-teal);
  }

  .actions-column {
    justify-content: flex-end;
  }
}
</style>
