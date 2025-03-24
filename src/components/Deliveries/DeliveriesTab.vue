<template>
  <div class="deliveries-tab">
    <h2>Поставки</h2>
    <button @click="openDeliveryModal" class="add-delivery-button">
      Добавить поставку
    </button>

    <div v-if="error" class="error-message">
      {{ error }}
      <button
        @click="store.commit('deliveries/SET_ERROR', null)"
        class="close-error"
      >
        ×
      </button>
    </div>

    <div v-if="store.state.deliveries.isLoading" class="loading-overlay">
      Загрузка...
    </div>

    <div class="delivery-list">
      <div v-if="deliveries.length === 0" class="empty-list-message">
        Нет доступных поставок
      </div>

      <div
        v-for="delivery in deliveries"
        :key="delivery.delivery_id"
        class="delivery-item"
      >
        <div class="delivery-header">
          <div class="delivery-info">
            <p><strong>Поставщик:</strong> {{ delivery.supplier_name }}</p>
            <p>
              <strong>Дата поставки:</strong>
              {{ formatDate(delivery.delivery_date) }}
            </p>
            <p>
              <strong>Документ:</strong>
              {{ delivery.document_path || "Не указан" }}
            </p>
          </div>
          <div class="delivery-actions">
            <button
              @click="deleteDelivery(delivery.delivery_id)"
              class="delete-button"
              :disabled="isDeleting || store.state.deliveries.isLoading"
            >
              {{ isDeleting ? "Удаление..." : "Удалить" }}
            </button>
          </div>
        </div>

        <div class="delivery-materials" v-if="delivery.materials?.length">
          <h4>Материалы в поставке:</h4>
          <div
            v-for="material in delivery.materials"
            :key="material.delivery_material_id"
            class="material-item"
          >
            <p>
              {{ material.material_name }} ({{ material.quantity }}
              {{ material.unit }})
            </p>
            <p>Цена за единицу: {{ material.cost_per_unit }} ₽</p>
          </div>
        </div>
      </div>
    </div>

    <Modal :isOpen="isDeliveryModalOpen" @close="closeDeliveryModal" size="lg">
      <h3>Добавить новую поставку</h3>
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
  if (!confirm('Вы уверены, что хотите удалить эту поставку?')) return;
  
  isDeleting.value = true;
  store.commit('deliveries/SET_ERROR', null);
  
  try {
    await store.dispatch('deliveries/deleteDeliveryAction', id);
    await store.dispatch('deliveries/fetchDeliveries');
  } catch (err) {
    console.error('Delete delivery error:', err);
    store.commit('deliveries/SET_ERROR', 
      err.response?.data?.message || 
      err.message || 
      'Ошибка при удалении поставки');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(async () => {
  try {
    await store.dispatch("deliveries/fetchDeliveries");
  } catch (err) {
    console.error("Fetch deliveries error:", err);
  }
});
</script>

<style scoped>
.delivery-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.delivery-materials {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.material-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-bottom: 16px;
}
</style>
