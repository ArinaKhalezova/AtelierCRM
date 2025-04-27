<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ fitting ? "Редактирование примерки" : "Добавление примерки" }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <div class="form-group">
            <label>Дата и время примерки:</label>
            <input
              type="datetime-local"
              v-model="formData.fitting_date"
              required
              class="input"
            />
          </div>

          <div class="form-group">
            <label>Результат:</label>
            <select v-model="formData.result" class="input">
              <option value="">Не указано</option>
              <option value="Успешно">Успешно</option>
              <option value="Требуются доработки">Требуются доработки</option>
              <option value="Отменена">Отменена</option>
            </select>
          </div>

          <div class="form-group">
            <label>Примечания:</label>
            <textarea
              v-model="formData.notes"
              rows="4"
              class="textarea"
              placeholder="Дополнительная информация о примерке..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="close" class="btn secondary">
            Отмена
          </button>
          <button type="submit" class="btn primary" :disabled="isSubmitting">
            {{ isSubmitting ? "Сохранение..." : "Сохранить" }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  isOpen: Boolean,
  fitting: Object,
  orderId: Number,
});

const emit = defineEmits(["close", "save"]);

const formData = ref(initializeFormData());
const isSubmitting = ref(false);
const error = ref(null);

function initializeFormData() {
  if (props.fitting) {
    return {
      fitting_date: formatDateTimeForInput(props.fitting.fitting_date),
      result: props.fitting.result || "",
      notes: props.fitting.notes || "",
    };
  }

  // Для новой примерки - устанавливаем дату на завтра в 10:00 по умолчанию
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return {
    fitting_date: formatDateTimeForInput(tomorrow.toISOString()),
    result: "",
    notes: "",
  };
}

function formatDateTimeForInput(dateTimeString) {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);

  // Корректировка для часового пояса
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);

  return localDate.toISOString().slice(0, 16);
}

watch(
  () => props.fitting,
  (newFitting) => {
    formData.value = initializeFormData();
  },
  { deep: true }
);

const close = () => {
  error.value = null;
  emit("close");
};

const validate = () => {
  if (!formData.value.fitting_date) {
    error.value = "Дата примерки обязательна";
    return false;
  }

  const fittingDate = new Date(formData.value.fitting_date);
  const now = new Date();

  if (fittingDate < now) {
    error.value = "Дата примерки не может быть в прошлом";
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (!validate()) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    const fittingData = {
      ...formData.value,
      order_id: props.orderId,
    };

    if (props.fitting) {
      fittingData.fitting_id = props.fitting.fitting_id;
    }

    emit("save", fittingData);
  } catch (err) {
    error.value = err.message || "Ошибка при сохранении";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h2 {
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input,
.textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus,
.textarea:focus,
select:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(32, 201, 151, 0.2);
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background-color: var(--success);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-success);
}

.btn.primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn.secondary {
  background-color: var(--danger);
  color: #ffffff;
}

.btn.secondary:hover {
  background-color:  var(--dark-danger);
}

.error-message {
  color: var(--danger);
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff0f0;
  border-radius: 6px;
  text-align: center;
}
</style>
