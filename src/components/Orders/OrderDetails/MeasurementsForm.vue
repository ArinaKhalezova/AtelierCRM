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
      <button @click="cancel" class="btn outline">Отмена</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  initialMeasurements: {
    type: Object,
    default: () => ({}),
  },
  orderId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["save", "cancel"]);

const store = useStore();
const formData = ref({ ...props.initialMeasurements });

watch(
  () => props.initialMeasurements,
  (newVal) => {
    formData.value = { ...newVal };
  },
  { immediate: true }
);

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
      chest_size: formData.value.chest_size
        ? Number(formData.value.chest_size)
        : null,
      waist_size: formData.value.waist_size
        ? Number(formData.value.waist_size)
        : null,
      hip_size: formData.value.hip_size
        ? Number(formData.value.hip_size)
        : null,
      shoulders_width: formData.value.shoulders_width
        ? Number(formData.value.shoulders_width)
        : null,
      height: formData.value.height ? Number(formData.value.height) : null,
    };

    await store.dispatch("orderDetails/saveMeasurements", {
      orderId: props.orderId,
      measurements: measurementsData,
    });

    emit("save");
  } catch (error) {
    console.error("Ошибка сохранения мерок:", error);
    store.commit("orderDetails/SET_ERROR", error.message);
    // Можно добавить более красивое уведомление для пользователя
  }
};

const cancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.measurements-form {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--warm-gray);
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(77, 72, 71, 0.2);
  border-radius: var(--border-radius);
  background-color: white;
  font-size: 0.95rem;
  color: var(--dark-teal);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn.primary {
  background-color: var(--teal);
  color: white;
  border: none;
}

.btn.primary:hover {
  background-color: var(--dark-teal);
}

.btn.outline {
  background-color: white;
  border: 1px solid var(--teal);
  color: var(--teal);
}

.btn.outline:hover {
  background-color: rgba(139, 170, 173, 0.1);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
