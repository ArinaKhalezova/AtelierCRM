<template>
  <div class="suppliers-tab">
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
        <h3>Добавить поставщика</h3>
        <form @submit.prevent="addSupplier">
          <div class="form-group">
            <label>Название:</label>
            <input v-model="newSupplier.org_name" required />
          </div>
          <div class="form-group">
            <label>Телефон:</label>
            <input
              v-model="newSupplier.phone_number"
              required
              pattern="[\d\+][\d\s\-\(\)]*"
              title="Введите корректный номер телефона"
            />
          </div>
          <div class="form-group">
            <label>Адрес:</label>
            <input v-model="newSupplier.address" required />
          </div>
          <div class="form-group">
            <label>ИНН:</label>
            <input
              v-model="newSupplier.inn"
              required
              pattern="\d{10}|\d{12}"
              title="ИНН должен содержать 10 или 12 цифр"
              maxlength="12"
            />
          </div>
          <button type="submit" class="submit-button">Добавить</button>
        </form>
      </div>
    </Modal>

    <Modal :isOpen="isSupplierModalOpen" @close="closeSupplierModal">
      <div class="modal-form">
        <h3>
          {{
            editingSupplier ? "Редактировать поставщика" : "Добавить поставщика"
          }}
        </h3>
        <form @submit.prevent="saveSupplier">
          <div class="form-group">
            <label>Название:</label>
            <input v-model="newSupplier.org_name" required />
          </div>
          <div class="form-group">
            <label>Телефон:</label>
            <input
              v-model="newSupplier.phone_number"
              required
              pattern="[\d\+][\d\s\-\(\)]*"
              title="Введите корректный номер телефона"
            />
          </div>
          <div class="form-group">
            <label>Адрес:</label>
            <input v-model="newSupplier.address" required />
          </div>
          <div class="form-group">
            <label>ИНН:</label>
            <input
              v-model="newSupplier.inn"
              required
              pattern="\d{10}|\d{12}"
              title="ИНН должен содержать 10 или 12 цифр"
              maxlength="12"
            />
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

const validatePhone = (phone) => {
  // Простая валидация телефона (минимум 5 цифр)
  const phoneRegex = /^[\d\+][\d\s\-\(\)]{4,}$/;
  return phoneRegex.test(phone);
};

const validateINN = (inn) => {
  // Валидация ИНН (10 или 12 цифр)
  const innRegex = /^(\d{10}|\d{12})$/;
  return innRegex.test(inn);
};

const editingSupplier = ref(null);

const store = useStore();
const isSupplierModalOpen = ref(false);
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
  editingSupplier.value = { ...supplier };
  newSupplier.value = {
    org_name: supplier.org_name,
    phone_number: supplier.phone_number,
    address: supplier.address,
    inn: supplier.inn,
  };
  isSupplierModalOpen.value = true;
};

const closeSupplierModal = () => {
  isSupplierModalOpen.value = false;
  editingSupplier.value = null;
  newSupplier.value = { org_name: "", phone_number: "", address: "", inn: "" };
  store.commit("suppliers/SET_ERROR", null);
};

const saveSupplier = async () => {
  try {
    // Общая валидация
    if (!Object.values(newSupplier.value).every((field) => field.trim())) {
      store.commit(
        "suppliers/SET_ERROR",
        "Все поля обязательны для заполнения"
      );
      return;
    }

    if (!/^\d{10}$|^\d{12}$/.test(newSupplier.value.inn)) {
      store.commit(
        "suppliers/SET_ERROR",
        "ИНН должен содержать 10 или 12 цифр"
      );
      return;
    }

    // Дополнительная проверка для редактирования
    if (
      editingSupplier.value &&
      editingSupplier.value.inn !== newSupplier.value.inn
    ) {
      const innExists = suppliers.value.some(
        (s) =>
          s.inn === newSupplier.value.inn &&
          s.supplier_id !== editingSupplier.value.supplier_id
      );

      if (innExists) {
        store.commit(
          "suppliers/SET_ERROR",
          "Поставщик с таким ИНН уже существует"
        );
        return;
      }
    }

    if (editingSupplier.value) {
      // Редактирование существующего поставщика
      await store.dispatch("suppliers/updateSupplierAction", {
        id: editingSupplier.value.supplier_id,
        supplierData: newSupplier.value,
      });
    } else {
      // Добавление нового поставщика
      await store.dispatch("suppliers/addSupplierAction", newSupplier.value);
    }

    // Общие действия после успешного сохранения
    closeSupplierModal();
    await store.dispatch("suppliers/fetchSuppliers");
  } catch (err) {
    console.error("Save supplier error:", err);
  }
};

const addSupplier = async () => {
  try {
    // Валидация
    if (!Object.values(newSupplier.value).every((field) => field.trim())) {
      store.commit(
        "suppliers/SET_ERROR",
        "Все поля обязательны для заполнения"
      );
      return;
    }

    if (!/^\d{10}$|^\d{12}$/.test(newSupplier.value.inn)) {
      store.commit(
        "suppliers/SET_ERROR",
        "ИНН должен содержать 10 или 12 цифр"
      );
      return;
    }

    // Отправка данных
    await store.dispatch("suppliers/addSupplierAction", {
      org_name: newSupplier.value.org_name.trim(),
      phone_number: newSupplier.value.phone_number.trim(),
      address: newSupplier.value.address.trim(),
      inn: newSupplier.value.inn.trim(),
    });

    // Сброс формы
    newSupplier.value = {
      org_name: "",
      phone_number: "",
      address: "",
      inn: "",
    };
    closeSupplierModal();

    // Обновление списка
    await store.dispatch("suppliers/fetchSuppliers");
  } catch (err) {
    console.error("Add supplier error:", err);

    let errorMessage = "Ошибка при добавлении поставщика";
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.message.includes("409")) {
      errorMessage = "Поставщик с таким ИНН уже существует";
    }

    store.commit("suppliers/SET_ERROR", errorMessage);
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
