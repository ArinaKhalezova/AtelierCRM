<template>
  <div class="deliveries-tab">
    <div class="header">
      <h2>Поставки</h2>
      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Поиск поставок..." />
        </div>
        <button @click="openDeliveryModal" class="add-button">
          <span class="plus-icon">+</span> Добавить поставку
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button
        @click="store.commit('deliveries/SET_ERROR', null)"
        class="close-error"
      >
        ×
      </button>
    </div>

    <div class="table-wrapper">
      <table class="deliveries-table">
        <thead>
          <tr>
            <th>№ поставки</th>
            <th>Поставщик</th>
            <th>Дата</th>
            <th>Материалы</th>
            <th>Накладная</th>
            <th class="actions-column">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="delivery in filteredDeliveries"
            :key="delivery.delivery_id"
          >
            <td>{{ delivery.delivery_number }}</td>
            <td>{{ delivery.supplier_name }}</td>
            <td>{{ formatDate(delivery.delivery_date) }}</td>
            <td>
              <div
                v-for="material in delivery.materials"
                :key="material.delivery_material_id"
                class="material-item"
              >
                {{ material.material_name }} ({{ material.quantity }}
                {{ material.unit }})
              </div>
            </td>
            <td>
              <button
                v-if="delivery.document_name"
                @click="downloadDocument(delivery.delivery_id)"
                class="download-btn"
              >
                <svg class="download-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ delivery.document_name }}
              </button>
              <span v-else>Нет накладной</span>
            </td>
            <td class="actions-column">
              <button @click="openEditModal(delivery)" class="edit-button">
                Редактировать
              </button>
              <button
                @click="deleteDelivery(delivery.delivery_id)"
                class="delete-button"
                :disabled="isDeleting"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :isOpen="isDeliveryModalOpen" @close="closeDeliveryModal" size="lg">
      <NewDeliveryForm
        @submit="handleDeliverySubmit"
        @cancel="closeDeliveryModal"
      />
    </Modal>

    <Modal :isOpen="isEditModalOpen" @close="closeEditModal" size="lg">
      <EditDeliveryForm
        :delivery="selectedDelivery"
        @submit="handleDeliveryUpdate"
        @cancel="closeEditModal"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";
import NewDeliveryForm from "./NewDeliveryForm.vue";
import EditDeliveryForm from "./EditDeliveryForm.vue";

const store = useStore();
const searchQuery = ref("");
const isDeliveryModalOpen = ref(false);
const isDeleting = ref(false);

const isEditModalOpen = ref(false);
const selectedDelivery = ref(null);

// Computed
const deliveries = computed(() => store.state.deliveries.deliveries);
const error = computed(() => store.state.deliveries.error);

const filteredDeliveries = computed(() => {
  if (!searchQuery.value) return deliveries.value;

  const query = searchQuery.value.toLowerCase();
  return deliveries.value.filter(
    (delivery) =>
      delivery.delivery_number?.toLowerCase().includes(query) ||
      delivery.supplier_name.toLowerCase().includes(query) ||
      delivery.delivery_date.toLowerCase().includes(query) ||
      (delivery.document_name &&
        delivery.document_name.toLowerCase().includes(query)) ||
      delivery.materials.some(
        (material) =>
          material.material_name.toLowerCase().includes(query) ||
          material.unit.toLowerCase().includes(query)
      )
  );
});

// методы
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const openDeliveryModal = () => {
  isDeliveryModalOpen.value = true;
};

const closeDeliveryModal = () => {
  isDeliveryModalOpen.value = false;
  store.commit("deliveries/SET_ERROR", null);
};

const openEditModal = (delivery) => {
  selectedDelivery.value = { ...delivery };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  store.commit("deliveries/SET_ERROR", null);
};

const handleDeliverySubmit = async () => {
  await store.dispatch("deliveries/fetchDeliveries");
  closeDeliveryModal();
};

const handleDeliveryUpdate = async () => {
  await store.dispatch("deliveries/fetchDeliveries");
  isEditModalOpen.value = false;
};

const downloadDocument = async (deliveryId) => {
  try {
    const delivery = store.state.deliveries.deliveries.find(
      (d) => d.delivery_id === deliveryId
    );

    // Используем действие Vuex store вместо прямого вызова API
    const blob = await store.dispatch(
      "deliveries/downloadDocument",
      deliveryId
    );

    // Создаем URL для скачивания
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", delivery.document_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Ошибка скачивания файла:", error);
    store.commit("deliveries/SET_ERROR", error.message);
  }
};

const deleteDelivery = async (id) => {
  if (
    !confirm(
      "Будут удалены все материалы из этой поставки. Вы уверены, что хотите удалить эту поставку?"
    )
  )
    return;

  isDeleting.value = true;
  store.commit("deliveries/SET_ERROR", null);

  try {
    await store.dispatch("deliveries/deleteDeliveryAction", id);
    await store.dispatch("deliveries/fetchDeliveries");
  } catch (err) {
    console.error("Delete delivery error:", err);
    store.commit(
      "deliveries/SET_ERROR",
      err.response?.data?.message ||
        err.message ||
        "Ошибка при удалении поставки"
    );
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  try {
    await store.dispatch("deliveries/fetchDeliveries");
  } catch (err) {
    console.error("Fetch deliveries error:", err);
  }
});
</script>

<style scoped>
.deliveries-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.add-button {
  background-color: var(--success);
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
  background-color: var(--dark-success);
  opacity: 0.95;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.deliveries-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.deliveries-table th,
.deliveries-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.deliveries-table th {
  background-color: var(--dark-teal);
  color: white;
  position: sticky;
  top: 0;
  font-weight: 500;
}

.material-item {
  padding: 0.25rem 0;
}

.material-item:not(:last-child) {
  border-bottom: 1px dashed #eee;
}

.btn.small {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.btn.primary {
  background-color: var(--info);
  color: white;
}

.btn.secondary {
  background-color: var(--info);
  color: #333;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--text-color); /* или конкретный цвет, например: #2c3e50 */
  border: 1px solid var(--border-color); /* например: #d1d5db */
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.download-btn:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-color: rgb(17, 74, 92);
  color: rgb(17, 74, 92);
}

.download-icon {
  width: 1rem;
  height: 1rem;
  color: currentColor;
}

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.deliveries-table tr:hover {
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
  transition: all 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
  opacity: 0.95;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--danger);
}

@media (max-width: 768px) {
  .deliveries-table {
    display: block;
    width: 100%;
  }

  .deliveries-table thead {
    display: none;
  }

  .deliveries-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .deliveries-table td {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border-bottom: none;
  }

  .deliveries-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: var(--dark-teal);
  }

  .actions-column {
    justify-content: flex-start;
  }
}
</style>
