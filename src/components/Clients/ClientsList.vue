<template>
  <div class="clients-list">
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="header">
      <h2>Клиенты</h2>
      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Поиск клиентов..." />
        </div>
        <button @click="openModal()" class="add-client-button">
          <span class="plus-icon">+</span> Добавить клиента
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="table-wrapper">
      <div class="table-container">
        <table class="client-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Email</th>
              <th class="actions-column">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in filteredClients" :key="client.client_id">
              <td data-label="ФИО">{{ client.fullname }}</td>
              <td data-label="Телефон">{{ client.phone_number }}</td>
              <td data-label="Email">{{ client.email || "—" }}</td>
              <td class="actions-column" data-label="Действия">
                <button @click="openModal(client)" class="edit-button">
                  Редактировать
                </button>
                <button
                  @click="deleteClient(client.client_id)"
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

    <!-- Единое модальное окно -->
    <Modal :isOpen="isModalOpen" @close="closeModal">
      <div class="modal-form">
        <h3>{{ isEditing ? "Редактирование" : "Добавление" }} клиента</h3>

        <div v-if="formErrors._general" class="form-error">
          {{ formErrors._general }}
        </div>

        <form @submit.prevent="saveClient">
          <div class="form-group" :class="{ 'has-error': formErrors.fullname }">
            <label>ФИО:</label>
            <input
              v-model="formData.fullname"
              required
              @input="formErrors.fullname = ''"
            />
            <span v-if="formErrors.fullname" class="field-error">
              {{ formErrors.fullname }}
            </span>
            <div class="hint">Минимум 2 символа, только буквы и дефисы</div>
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
              @input="formErrors.phone_number = ''"
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
              @input="formErrors.email = ''"
            />
            <span v-if="formErrors.email" class="field-error">
              {{ formErrors.email }}
            </span>
            <div class="hint">Необязательное поле</div>
          </div>

          <button type="submit" class="submit-button">
            {{ isEditing ? "Сохранить" : "Добавить" }}
          </button>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/Modal.vue";

const store = useStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const searchQuery = ref("");
const formData = ref({
  fullname: "",
  phone_number: "",
  email: "",
});
const formErrors = ref({});

const clients = computed(() => store.state.clients.clients);
const error = computed(() => store.state.clients.error);

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value;

  const query = searchQuery.value.toLowerCase();
  return clients.value.filter(
    (client) =>
      client.fullname.toLowerCase().includes(query) ||
      client.phone_number.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query))
  );
});

const openModal = (client = null) => {
  isEditing.value = !!client;
  formData.value = client
    ? { ...client }
    : {
        fullname: "",
        phone_number: "",
        email: "",
      };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {};
  formErrors.value = {};
  store.commit("clients/SET_ERROR", null);
};

const saveClient = async () => {
  formErrors.value = {};

  try {
    const action = isEditing.value
      ? "clients/updateClientAction"
      : "clients/addClientAction";

    const payload = isEditing.value
      ? {
          id: formData.value.client_id,
          clientData: formData.value,
        }
      : formData.value;

    const result = await store.dispatch(action, payload);

    if (result.success) {
      await store.dispatch("clients/fetchClients");
      closeModal();
    } else {
      formErrors.value = result.errors || {};
    }
  } catch (err) {
    console.error("Ошибка сохранения клиента:", err);
  }
};

const deleteClient = async (id) => {
  if (confirm("Удалить клиента?")) {
    try {
      await store.dispatch("clients/deleteClientAction", id);
    } catch (err) {
      store.commit("clients/SET_ERROR", "Ошибка при удалении");
    }
  }
};

onMounted(async () => {
  await store.dispatch("clients/fetchClients");
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

.clients-list {
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

.add-client-button {
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

.add-client-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
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

.client-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.client-table th,
.client-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.client-table th {
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

.client-table tr:last-child td {
  border-bottom: none;
}

.client-table tr:hover {
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
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #c82333;
  opacity: 0.95;
}

/* Стили для модального окна */
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
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
}

.submit-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

/* Адаптивность */
@media (max-width: 768px) {
  .clients-list {
    padding: 1rem;
  }

  .client-table {
    display: block;
    width: 100%;
  }

  .client-table thead {
    display: none;
  }

  .client-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .client-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: none;
    text-align: right;
  }

  .client-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: var(--dark-teal);
  }

  .actions-column {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-client-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
