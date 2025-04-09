<template>
  <div class="deliveries-tab">
    <div class="header">
      <h2>Поставки</h2>
      <button @click="openDeliveryModal" class="add-button">
        <span class="plus-icon">+</span> Добавить поставку
      </button>
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
            <th>Поставщик</th>
            <th>Дата</th>
            <th>Материалы</th>
            <th class="actions-column">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="delivery in deliveries" :key="delivery.delivery_id">
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
            <td class="actions-column">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";
import NewDeliveryForm from "./NewDeliveryForm.vue";

const store = useStore();
const isDeliveryModalOpen = ref(false);
const isDeleting = ref(false);

// Computed
const deliveries = computed(() => store.state.deliveries.deliveries);
const error = computed(() => store.state.deliveries.error);

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

const handleDeliverySubmit = async () => {
  await store.dispatch("deliveries/fetchDeliveries");
  closeDeliveryModal();
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

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.deliveries-table tr:hover {
  background-color: rgba(139, 170, 173, 0.05);
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
