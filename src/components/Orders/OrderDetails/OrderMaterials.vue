<template>
  <div class="section">
    <h3>Материалы</h3>
    <div v-if="materials.length > 0" class="items">
      <div
        v-for="material in materials"
        :key="material.order_material_id"
        class="item"
      >
        <div class="info">
          <span class="name">{{ material.material_name }}</span>
          <span class="quantity">
            {{ material.quantity }} {{ material.unit }} ×
            {{ material.cost_per_unit }} ₽
          </span>
          <span class="total">
            {{ (material.quantity * material.cost_per_unit).toFixed(2) }} ₽
          </span>
        </div>
        <button
          @click="removeMaterial(material.order_material_id)"
          class="btn danger"
        >
          Удалить
        </button>
      </div>
    </div>
    <div v-else class="empty">Нет материалов</div>
  </div>
</template>

<script setup>
defineProps({
  materials: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(["remove-material"]);

const removeMaterial = (materialId) => {
  emit("remove-material", materialId);
};
</script>

<style scoped>
.section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.2rem;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(244, 255, 248, 0.5);
  border-radius: var(--border-radius);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-weight: 500;
  color: var(--dark-teal);
}

.quantity {
  font-size: 0.9rem;
  color: var(--warm-gray);
}

.total {
  font-weight: 500;
  color: var(--dark-teal);
}

.btn.danger {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background-color: var(--danger);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn.danger:hover {
  background-color: #c82333;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--warm-gray);
  font-size: 1rem;
}
</style>
