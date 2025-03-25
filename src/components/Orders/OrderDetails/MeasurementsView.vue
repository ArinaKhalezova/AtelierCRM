<template>
  <div class="measurements-view">
    <div v-if="measurements" class="measurements-grid">
      <div v-if="measurements.size" class="measurement-item">
        <span class="label">Размер:</span>
        <span class="value">{{ measurements.size }}</span>
      </div>
      <div v-if="measurements.chest_size" class="measurement-item">
        <span class="label">Обхват груди:</span>
        <span class="value">{{ measurements.chest_size }} см</span>
      </div>
      <div v-if="measurements.waist_size" class="measurement-item">
        <span class="label">Обхват талии:</span>
        <span class="value">{{ measurements.waist_size }} см</span>
      </div>
      <div v-if="measurements.hip_size" class="measurement-item">
        <span class="label">Обхват бедер:</span>
        <span class="value">{{ measurements.hip_size }} см</span>
      </div>
      <div v-if="measurements.shoulders_width" class="measurement-item">
        <span class="label">Ширина плеч:</span>
        <span class="value">{{ measurements.shoulders_width }} см</span>
      </div>
      <div v-if="measurements.height" class="measurement-item">
        <span class="label">Рост:</span>
        <span class="value">{{ measurements.height }} см</span>
      </div>
    </div>
    <div v-else class="empty">Мерки не указаны</div>

    <button @click="$emit('edit')" class="btn primary">
      {{ measurements ? "Редактировать мерки" : "Добавить мерки" }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  measurements: {
    type: Object,
    default: null
  }
});
</script>

<style scoped>
.measurements-view {
  margin-top: 15px;
}

.measurements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.measurement-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.measurement-item .label {
  font-weight: 500;
}

.measurement-item .value {
  font-weight: bold;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
  margin-bottom: 15px;
}

.btn.primary {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  background: #1976d2;
  color: white;
}
</style>