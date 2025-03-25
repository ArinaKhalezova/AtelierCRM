<template>
  <div class="deliveries-view">
    <div class="header">
      <h1>Управление поставками</h1>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'materials' }"
          @click="activeTab = 'materials'"
        >
          Материалы
        </button>
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
    </div>

    <div class="tab-content">
      <MaterialsTab v-if="activeTab === 'materials'" />
      <DeliveriesTab v-if="activeTab === 'supplies'" />
      <SuppliersTab v-if="activeTab === 'suppliers'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DeliveriesTab from "@/components/Deliveries/DeliveriesTab.vue";
import SuppliersTab from "@/components/Supplier/SuppliersTab.vue";
import MaterialsTab from "@/components/Materials/MaterialsTab.vue";

const activeTab = ref("materials");
</script>

<style scoped>
.deliveries-view {
  /* width: 100%;
  height: 100%;
  padding: 1.5rem; */

  background-color: var(--surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.header {
  margin-bottom: 2rem;
}

h1 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--warm-gray);
  padding-bottom: 0.5rem;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  color: var(--warm-gray);
  font-weight: 500;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  transition: all 0.2s ease;
}

.tabs button.active {
  color: var(--dark-teal);
  background-color: rgba(139, 170, 173, 0.1);
  border-bottom: 2px solid var(--dark-teal);
}

.tabs button:hover:not(.active) {
  color: var(--dark-teal);
  background-color: rgba(139, 170, 173, 0.05);
}

.tab-content {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  min-height: 60vh;
}
</style>
