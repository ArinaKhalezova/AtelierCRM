<template>
  <div class="supplier-list">
    <div v-for="supplier in suppliers" :key="supplier.id" class="supplier-item">
      <p><strong>Название:</strong> {{ supplier.name }}</p>
      <p><strong>Телефон:</strong> {{ supplier.phone }}</p>
      <p><strong>Адрес:</strong> {{ supplier.address }}</p>
      <p><strong>ИНН:</strong> {{ supplier.inn }}</p>
      <button @click="deleteSupplier(supplier.id)" class="delete-button">Удалить</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['allSuppliers']),
    suppliers() {
      return this.allSuppliers;
    }
  },
  methods: {
    ...mapActions(['deleteSupplierAction']),
    deleteSupplier(supplierId) {
      if (confirm('Вы уверены, что хотите удалить этого поставщика?')) {
        this.deleteSupplierAction(supplierId);
      }
    }
  }
};
</script>

<style scoped>
.supplier-list {
  display: grid;
  gap: 1rem;
}

.supplier-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button {
  background-color: #f44336;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.delete-button:hover {
  opacity: 0.9;
}
</style>