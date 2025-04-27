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
    default: null,
  },
});
</script>

<style scoped>
.measurements-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.measurements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.measurement-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(244, 255, 248, 0.3);
  border-radius: var(--border-radius);
}

.measurement-item .label {
  font-size: 0.9rem;
  color: var(--warm-gray);
}

.measurement-item .value {
  font-weight: 500;
  color: var(--dark-teal);
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--warm-gray);
  font-size: 1rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.btn.primary {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  background-color: var(--info);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn.primary:hover {
  background-color: var(--dark-info);
}

@media (max-width: 768px) {
  .measurements-grid {
    grid-template-columns: 1fr 1fr;
  }

  .btn.primary {
    width: 100%;
  }
}
</style>
