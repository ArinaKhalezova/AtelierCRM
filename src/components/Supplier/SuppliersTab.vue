<template>
  <div class="suppliers-tab">
    <h2>Поставщики</h2>
    <button @click="openSupplierModal" class="add-supplier-button">
      Добавить поставщика
    </button>

    <div class="supplier-list">
      <div v-for="supplier in suppliers" :key="supplier.id" class="supplier-item">
        <p><strong>Название:</strong> {{ supplier.name }}</p>
        <p><strong>Телефон:</strong> {{ supplier.phone }}</p>
        <p><strong>Адрес:</strong> {{ supplier.address }}</p>
        <p><strong>ИНН:</strong> {{ supplier.inn }}</p>
        <button @click="deleteSupplier(supplier.id)" class="delete-button">
          Удалить
        </button>
      </div>
    </div>

    <!-- Модальное окно для добавления поставщика -->
    <Modal :isOpen="isSupplierModalOpen" @close="closeSupplierModal">
      <h3>Добавить нового поставщика</h3>
      <form @submit.prevent="addSupplier">
        <div class="form-group">
          <label>Название организации:</label>
          <input v-model="newSupplier.name" required />
        </div>
        <div class="form-group">
          <label>Телефон:</label>
          <input v-model="newSupplier.phone" required />
        </div>
        <div class="form-group">
          <label>Адрес:</label>
          <input v-model="newSupplier.address" required />
        </div>
        <div class="form-group">
          <label>ИНН:</label>
          <input v-model="newSupplier.inn" required />
        </div>
        <button type="submit">Добавить поставщика</button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import Modal from './Modal.vue';

const store = useStore();

const isSupplierModalOpen = ref(false);
const newSupplier = ref({
  name: '',
  phone: '',
  address: '',
  inn: '',
});

const suppliers = computed(() => store.getters.allSuppliers);

const openSupplierModal = () => {
  isSupplierModalOpen.value = true;
};

const closeSupplierModal = () => {
  isSupplierModalOpen.value = false;
};

const addSupplier = () => {
  store.dispatch('addSupplierAction', newSupplier.value);
  newSupplier.value = { name: '', phone: '', address: '', inn: '' };
  closeSupplierModal();
};

const deleteSupplier = (supplierId) => {
  if (confirm('Вы уверены, что хотите удалить этого поставщика?')) {
    store.dispatch('deleteSupplierAction', supplierId);
  }
};
</script>

<style scoped>
.add-supplier-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-supplier-button:hover {
  background-color: #3aa876;
}
</style>