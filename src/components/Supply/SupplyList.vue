<template>
  <div class="supply-list">
    <div v-for="supply in supplies" :key="supply.id" class="supply-item">
      <div class="supply-header">
        <div class="supply-info">
          <p><strong>Номер поставки:</strong> {{ supply.supplyNumber }}</p>
          <p><strong>Поставщик:</strong> {{ getSupplierName(supply.supplierId) }}</p>
        </div>
        <div class="supply-actions">
          <router-link 
            :to="`/supplies/${supply.id}`" 
            class="details-button"
          >
            Подробнее
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['allSupplies', 'getSupplierById']),
    supplies() {
      return this.allSupplies;
    }
  },
  methods: {
    getSupplierName(supplierId) {
      const supplier = this.getSupplierById(supplierId);
      return supplier ? supplier.name : 'Неизвестный поставщик';
    }
  }
};
</script>

<style scoped>
.supply-list {
  display: grid;
  gap: 1rem;
}

.supply-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.supply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.supply-info p {
  margin: 0.3rem 0;
}

.details-button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.details-button:hover {
  background-color: var(--primary-color);
}
</style>