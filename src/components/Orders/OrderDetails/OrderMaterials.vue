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
    default: () => []
  }
});

const emit = defineEmits(['remove-material']);

const removeMaterial = (materialId) => {
  emit('remove-material', materialId);
};
</script>

<style scoped>
.section {
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.items .item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.info {
  display: grid;
  gap: 5px;
  flex-grow: 1;
}

.name {
  font-weight: 500;
}

.quantity,
.total {
  font-size: 0.9em;
  color: #666;
}

.btn.danger {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  background: #d32f2f;
  color: white;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>