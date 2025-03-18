<template>
  <div class="supplies-page">
    <h1>Управление поставками</h1>
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'supplies' }"
        @click="activeTab = 'supplies'"
      >
        Поставки
      </button>
      <button
        :class="{ active: activeTab === 'suppliers' }"
        @click="activeTab = 'suppliers'"
      >
        Поставщики
      </button>
    </div>

    <div class="tab-content">
      <SuppliesTab v-if="activeTab === 'supplies'" />
      <SuppliersTab v-if="activeTab === 'suppliers'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SuppliersTab from "@/components/Supplier/SuppliersTab.vue";
import SuppliesTab from "@/components/Supply/SuppliesTab.vue";

const activeTab = ref('supplies');
</script>

<style scoped>
.supplies-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background-color 0.3s;
}

.tabs button.active {
  background-color: var(--primary-color);
  color: white;
}

.tab-content {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
