<template>
  <div class="deliveries-tab">
    <h2>Поставки</h2>
    <button @click="openDeliveryModal" class="add-delivery-button">
      Добавить поставку
    </button>

    <div class="delivery-list">
      <div v-for="delivery in deliveries" :key="delivery.delivery_id" class="delivery-item">
        <div class="delivery-header">
          <div class="delivery-info">
            <p><strong>Номер поставки:</strong> {{ delivery.delivery_id }}</p>
            <p>
              <strong>Материал:</strong>
              {{ delivery.material_name }}
            </p>
            <p><strong>Количество:</strong> {{ delivery.quantity }}</p>
            <p><strong>Стоимость:</strong> {{ delivery.cost }}</p>
          </div>
          <div class="delivery-actions">
            <button @click="deleteDelivery(delivery.delivery_id)" class="delete-button">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления поставки -->
    <Modal :isOpen="isDeliveryModalOpen" @close="closeDeliveryModal">
      <h3>Добавить новую поставку</h3>
      <NewDeliveryForm @submit="closeDeliveryModal" />
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

const deliveries = computed(() => store.state.deliveries.deliveries);

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("deliveries/fetchDeliveries");
});

const openDeliveryModal = () => {
  isDeliveryModalOpen.value = true;
};

const closeDeliveryModal = () => {
  isDeliveryModalOpen.value = false;
};

const deleteDelivery = async (deliveryId) => {
  if (confirm("Вы уверены, что хотите удалить эту поставку?")) {
    try {
      await store.dispatch("deliveries/deleteDeliveryAction", deliveryId);
    } catch (err) {
      console.error("Ошибка при удалении поставки:", err);
    }
  }
};
</script>

<style scoped>
.add-delivery-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-delivery-button:hover {
  background-color: #3aa876;
}
</style>
