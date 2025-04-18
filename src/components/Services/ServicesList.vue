<template>
  <div class="services-tab">
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="header">
      <h2>Услуги</h2>
      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Поиск услуг..." />
        </div>
        <button @click="openServiceModal" class="add-button">
          <span class="plus-icon">+</span> Добавить услугу
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="table-wrapper">
      <table class="services-table">
        <thead>
          <tr>
            <th>Категория</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Стоимость</th>
            <th class="actions-column">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.service_id">
            <td>{{ service.category }}</td>
            <td>{{ service.name }}</td>
            <td>{{ service.description || "—" }}</td>
            <td>{{ service.base_cost }} ₽</td>
            <td class="actions-column">
              <button @click="openEditModal(service)" class="edit-button">
                Редактировать
              </button>
              <button
                @click="deleteService(service.service_id)"
                class="delete-button"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Единое модальное окно для добавления/редактирования -->
    <Modal :isOpen="isModalOpen" @close="closeModal">
      <div class="modal-form">
        <h3>{{ isEditing ? "Редактирование" : "Добавление" }} услуги</h3>

        <div v-if="formErrors._general" class="form-error">
          {{ formErrors._general }}
        </div>

        <form @submit.prevent="saveService" class="form-grid">
          <div class="form-group" :class="{ 'has-error': formErrors.category }">
            <label>Категория</label>
            <select v-model="formData.category" required>
              <option value="" disabled>Выберите категорию</option>
              <option
                v-for="category in serviceCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            <span v-if="formErrors.category" class="field-error">
              {{ formErrors.category }}
            </span>
          </div>

          <div class="form-group" :class="{ 'has-error': formErrors.name }">
            <label>Название</label>
            <input v-model="formData.name" required minlength="2" />
            <span v-if="formErrors.name" class="field-error">
              {{ formErrors.name }}
            </span>
            <div class="hint">Минимум 2 символа</div>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': formErrors.description }"
          >
            <label>Описание</label>
            <textarea v-model="formData.description" rows="3" />
            <span v-if="formErrors.description" class="field-error">
              {{ formErrors.description }}
            </span>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': formErrors.base_cost }"
          >
            <label>Стоимость (₽)</label>
            <input
              v-model.number="formData.base_cost"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <span v-if="formErrors.base_cost" class="field-error">
              {{ formErrors.base_cost }}
            </span>
            <div class="hint">Число с двумя знаками после запятой</div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Отмена
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="submit-button"
            >
              {{
                isSubmitting
                  ? isEditing
                    ? "Сохранение..."
                    : "Добавление..."
                  : isEditing
                  ? "Сохранить"
                  : "Добавить"
              }}
            </button>
          </div>
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

const isSubmitting = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const searchQuery = ref("");
const formData = ref({
  service_id: null,
  category: "",
  name: "",
  description: "",
  base_cost: 0,
});
const formErrors = ref({});

const services = computed(() => store.state.services.services);
const serviceCategories = computed(
  () => store.state.services.serviceCategories
);
const error = computed(() => store.state.services.error);

const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value;

  const query = searchQuery.value.toLowerCase();
  return services.value.filter(
    (service) =>
      service.category.toLowerCase().includes(query) ||
      service.name.toLowerCase().includes(query) ||
      (service.description &&
        service.description.toLowerCase().includes(query)) ||
      service.base_cost.toString().includes(query)
  );
});

onMounted(async () => {
  await store.dispatch("services/fetchServices");
  await store.dispatch("services/fetchServiceCategories");
});

const openServiceModal = () => {
  isEditing.value = false;
  formData.value = {
    service_id: null,
    category: "",
    name: "",
    description: "",
    base_cost: 0,
  };
  isModalOpen.value = true;
};

const openEditModal = (service) => {
  isEditing.value = true;
  formData.value = { ...service };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formData.value = {
    service_id: null,
    category: "",
    name: "",
    description: "",
    base_cost: 0,
  };
  formErrors.value = {};
  store.commit("services/SET_ERROR", null);
};

const saveService = async () => {
  isSubmitting.value = true;
  formErrors.value = {};

  try {
    const action = isEditing.value
      ? "services/updateService"
      : "services/addService";

    const payload = isEditing.value
      ? {
          id: formData.value.service_id,
          serviceData: {
            category: formData.value.category,
            name: formData.value.name.trim(),
            description: formData.value.description.trim(),
            base_cost: parseFloat(formData.value.base_cost),
          },
        }
      : {
          category: formData.value.category,
          name: formData.value.name.trim(),
          description: formData.value.description.trim(),
          base_cost: parseFloat(formData.value.base_cost),
        };

    const result = await store.dispatch(action, payload);

    if (result?.success) {
      await store.dispatch("services/fetchServices");
      closeModal();
    } else if (result?.errors) {
      formErrors.value = result.errors;
    }
  } catch (err) {
    console.error("Ошибка при сохранении услуги:", err);
    if (err.response?.data?.errors) {
      formErrors.value = err.response.data.errors;
    }
  } finally {
    isSubmitting.value = false;
  }
};

const deleteService = async (serviceId) => {
  if (confirm("Вы уверены, что хотите удалить эту услугу?")) {
    isSubmitting.value = true;
    try {
      await store.dispatch("services/deleteService", serviceId);
      await store.dispatch("services/fetchServices");
    } catch (err) {
      console.error("Ошибка при удалении услуги:", err);
    } finally {
      isSubmitting.value = false;
    }
  }
};
</script>

<style scoped>
.services-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
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

.services-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.services-table th,
.services-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.services-table th {
  background-color: var(--dark-teal);
  color: white;
  position: sticky;
  top: 0;
  font-weight: 500;
}

.services-table td {
  vertical-align: top;
}

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.services-table tr:hover {
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

.modal-form {
  padding: 1.5rem;
  max-width: 800px;
}

.modal-form h3 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.has-error input,
.form-group.has-error select,
.form-group.has-error textarea {
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

.form-group label {
  font-weight: 500;
  color: var(--dark-teal);
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: var(--border);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.cancel-button {
  background-color: var(--warm-gray);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #5e5756;
  opacity: 0.95;
}

.submit-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #244a4b;
  opacity: 0.95;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .services-table {
    display: block;
    width: 100%;
  }

  .services-table thead {
    display: none;
  }

  .services-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .services-table td {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border-bottom: none;
  }

  .services-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: var(--dark-teal);
  }

  .actions-column {
    justify-content: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .controls {
    width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
