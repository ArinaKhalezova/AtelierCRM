<template>
  <div class="measurements-form">
    <div class="form-grid">
      <div class="form-group">
        <label>Размер:</label>
        <input
          v-model="formData.size"
          type="text"
          placeholder="Введите размер"
        />
      </div>

      <div class="form-group">
        <label>Обхват груди (см):</label>
        <input
          v-model.number="formData.chest_size"
          type="number"
          step="0.1"
          min="0"
        />
      </div>

      <div class="form-group">
        <label>Обхват талии (см):</label>
        <input
          v-model.number="formData.waist_size"
          type="number"
          step="0.1"
          min="0"
        />
      </div>

      <div class="form-group">
        <label>Обхват бедер (см):</label>
        <input
          v-model.number="formData.hip_size"
          type="number"
          step="0.1"
          min="0"
        />
      </div>

      <div class="form-group">
        <label>Ширина плеч (см):</label>
        <input
          v-model.number="formData.shoulders_width"
          type="number"
          step="0.1"
          min="0"
        />
      </div>

      <div class="form-group">
        <label>Рост (см):</label>
        <input
          v-model.number="formData.height"
          type="number"
          step="0.1"
          min="0"
        />
      </div>
    </div>

    <div class="form-actions">
      <button @click="save" class="btn primary">
        {{ initialMeasurements ? "Обновить" : "Сохранить" }}
      </button>
      <button @click="cancel" class="btn outline">
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  initialMeasurements: {
    type: Object,
    default: () => ({})
  },
  orderId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['save', 'cancel']);

const store = useStore();
const formData = ref({ ...props.initialMeasurements });

watch(() => props.initialMeasurements, (newVal) => {
  formData.value = { ...newVal };
}, { immediate: true });

const save = async () => {
  try {
    // Валидация
    if (
      !formData.value.size &&
      !formData.value.chest_size &&
      !formData.value.waist_size &&
      !formData.value.hip_size &&
      !formData.value.shoulders_width &&
      !formData.value.height
    ) {
      throw new Error("Заполните хотя бы одно поле");
    }

    // Подготовка данных
    const measurementsData = {
      size: formData.value.size || null,
      chest_size: formData.value.chest_size ? Number(formData.value.chest_size) : null,
      waist_size: formData.value.waist_size ? Number(formData.value.waist_size) : null,
      hip_size: formData.value.hip_size ? Number(formData.value.hip_size) : null,
      shoulders_width: formData.value.shoulders_width ? Number(formData.value.shoulders_width) : null,
      height: formData.value.height ? Number(formData.value.height) : null,
    };

    await store.dispatch("orders/saveMeasurements", {
      orderId: props.orderId,
      measurements: measurementsData,
    });

    emit('save');
  } catch (error) {
    console.error("Ошибка сохранения мерок:", error);
    alert(error.message || "Не удалось сохранить мерки");
  }
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.measurements-form {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn.primary {
  background: #1976d2;
  color: white;
  border: none;
}

.btn.outline {
  background: transparent;
  border: 1px solid #1976d2;
  color: #1976d2;
}
</style>