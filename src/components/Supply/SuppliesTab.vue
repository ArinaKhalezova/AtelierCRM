<template>
  <div class="supplies-tab">
    <h2>Поставки</h2>
    <button @click="openSupplyModal" class="add-supply-button">
      Добавить поставку
    </button>

    <div class="supply-list">
      <div v-for="supply in supplies" :key="supply.id" class="supply-item">
        <div class="supply-header">
          <div class="supply-info">
            <p><strong>Номер поставки:</strong> {{ supply.supplyNumber }}</p>
            <p><strong>Поставщик:</strong> {{ getSupplierName(supply.supplierId) }}</p>
          </div>
          <div class="supply-actions">
            <router-link :to="`/supplies/${supply.id}`" class="details-button">
              Подробнее
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления поставки -->
    <Modal :isOpen="isSupplyModalOpen" @close="closeSupplyModal">
      <h3>Добавить новую поставку</h3>
      <NewSupplyForm @submit="closeSupplyModal" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import Modal from '../Supplier/Modal.vue'; // Импортируем модальное окно
import NewSupplyForm from './NewSupplyForm.vue';

const store = useStore();

const isSupplyModalOpen = ref(false);

const supplies = computed(() => store.getters.allSupplies);

const openSupplyModal = () => {
  isSupplyModalOpen.value = true;
};

const closeSupplyModal = () => {
  isSupplyModalOpen.value = false;
};

const getSupplierName = (supplierId) => {
  const supplier = store.getters.getSupplierById(supplierId);
  return supplier ? supplier.name : 'Неизвестный поставщик';
};
</script>

<style scoped>
.add-supply-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-supply-button:hover {
  background-color: #3aa876;
}
</style>