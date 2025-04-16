<template>
  <div class="services-tab">
    <div class="header">
      <h2>Услуги</h2>
      <button @click="openServiceModal" class="add-button">
        <span class="plus-icon">+</span> Добавить услугу
      </button>
    </div>

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
          <tr v-for="service in services" :key="service.service_id">
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

    <Modal :isOpen="isServiceModalOpen" @close="closeServiceModal">
      <div class="modal-form">
        <h3>Добавить услугу</h3>
        <form @submit.prevent="addService" class="form-grid">
          <div class="form-group">
            <label>Категория</label>
            <select v-model="newService.category" required>
              <option value="" disabled>Выберите категорию</option>
              <option
                v-for="category in serviceCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Название</label>
            <input v-model="newService.name" required minlength="2" />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="newService.description" rows="3" />
          </div>
          <div class="form-group">
            <label>Стоимость (₽)</label>
            <input
              v-model.number="newService.base_cost"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-actions">
            <button
              type="button"
              @click="closeServiceModal"
              class="cancel-button"
            >
              Отмена
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="submit-button"
            >
              {{ isSubmitting ? "Добавление..." : "Добавить" }}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Модальное окно редактирования -->
    <Modal :isOpen="isEditModalOpen" @close="closeEditModal">
      <div class="modal-form">
        <h3>Редактировать услугу</h3>
        <form @submit.prevent="updateService" class="form-grid">
          <div class="form-group">
            <label>Категория</label>
            <select v-model="editedService.category" required>
              <option
                v-for="category in serviceCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Название</label>
            <input v-model="editedService.name" required minlength="2" />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="editedService.description" rows="3" />
          </div>
          <div class="form-group">
            <label>Стоимость (₽)</label>
            <input
              v-model.number="editedService.base_cost"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="cancel-button">
              Отмена
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="submit-button"
            >
              {{ isSubmitting ? "Сохранение..." : "Сохранить" }}
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
const isServiceModalOpen = ref(false);
const isEditModalOpen = ref(false);
const newService = ref({
  category: "",
  name: "",
  description: "",
  base_cost: 0,
});
const editedService = ref({
  service_id: null,
  category: "",
  name: "",
  description: "",
  base_cost: 0,
});

const services = computed(() => store.state.services.services);
const serviceCategories = computed(
  () => store.state.services.serviceCategories
);
const error = computed(() => store.state.services.error);

onMounted(async () => {
  await store.dispatch("services/fetchServices");
  await store.dispatch("services/fetchServiceCategories");
});

const openServiceModal = () => {
  isServiceModalOpen.value = true;
};

const closeServiceModal = () => {
  isServiceModalOpen.value = false;
  newService.value = { category: "", name: "", description: "", base_cost: 0 };
  store.commit("services/SET_ERROR", null);
};

const openEditModal = (service) => {
  editedService.value = { ...service };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editedService.value = {
    service_id: null,
    category: "",
    name: "",
    description: "",
    base_cost: 0,
  };
};

const addService = async () => {
  isSubmitting.value = true; // Устанавливаем в true перед началом отправки
  try {
    const serviceData = {
      category: newService.value.category,
      name: newService.value.name.trim(),
      description: newService.value.description.trim(),
      base_cost: parseFloat(newService.value.base_cost),
    };

    await store.dispatch("services/addService", serviceData);
    closeServiceModal();
  } catch (err) {
    console.error("Ошибка при добавлении услуги:", err);
  } finally {
    isSubmitting.value = false; // Всегда сбрасываем обратно в false
  }
};

const updateService = async () => {
  isSubmitting.value = true;
  try {
    const serviceData = {
      category: editedService.value.category,
      name: editedService.value.name.trim(),
      description: editedService.value.description.trim(),
      base_cost: parseFloat(editedService.value.base_cost),
    };

    await store.dispatch("services/updateService", {
      id: editedService.value.service_id,
      serviceData: serviceData,
    });
    closeEditModal();
  } catch (err) {
    console.error("Ошибка при обновлении услуги:", err);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteService = async (serviceId) => {
  if (confirm("Вы уверены, что хотите удалить эту услугу?")) {
    isSubmitting.value = true;
    try {
      await store.dispatch("services/deleteService", serviceId);
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
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
}
</style>
