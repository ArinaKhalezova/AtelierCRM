<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Редактирование заказа #{{ order.tracking_number }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3>Основная информация</h3>

          <div class="form-group">
            <label>Дата создания:</label>
            <input
              type="date"
              :value="formatDateForInput(formData.created_at)"
              disabled
              class="input-disabled"
            />
          </div>

          <div class="form-group">
            <label>Срок выполнения:</label>
            <input
              type="date"
              v-model="formData.deadline_date"
              required
              :min="minDeadlineDate"
              class="input"
              :disabled="!isAdmin"
            />
          </div>

          <div class="form-section">
            <h3>Комментарий</h3>
            <textarea
              v-model="formData.comment"
              rows="4"
              class="textarea"
              placeholder="Введите комментарий..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn secondary">
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
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  isOpen: Boolean,
  order: Object,
});

const emit = defineEmits(["close", "success"]);

const store = useStore();

const isAdmin = computed(() => store.getters["auth/isAdmin"]);
const formData = ref(initializeFormData());
const isSubmitting = ref(false);
const error = ref(null);

function initializeFormData() {
  if (!props.order) return { comment: "" };

  return {
    deadline_date: formatDateForInput(props.order.deadline_date),
    comment: props.order.comment || "",
    created_at: props.order.created_at,
  };
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split("T")[0];
}

const minDeadlineDate = computed(() => {
  return formatDateForInput(formData.value.created_at);
});

watch(
  () => props.order,
  (newOrder) => {
    formData.value = initializeFormData();
  },
  { deep: true }
);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await loadServices();
      await loadMaterials();
      orderServices.value = [...props.order.services];
      orderMaterials.value = props.order.materials.map((m) => ({
        ...m,
        available: m.quantity,
      }));
    }
  }
);

const closeModal = () => {
  error.value = null;
  emit("close");
};

const validateDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!formData.value.deadline_date) {
    error.value = "Дата завершения обязательна";
    return false;
  }

  const deadline = new Date(formData.value.deadline_date);
  deadline.setHours(0, 0, 0, 0);

  const created = new Date(formData.value.created_at);
  created.setHours(0, 0, 0, 0);

  if (deadline < created) {
    error.value = "Дата завершения не может быть раньше даты создания";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateDates()) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    const orderData = {
      deadline_date: formData.value.deadline_date,
      comment: formData.value.comment.trim(),
    };

    const success = await store.dispatch("orders/editOrder", {
      orderId: props.order.order_id,
      orderData,
    });

    if (success) {
      emit("success");
      closeModal();
    }
  } catch (err) {
    error.value =
      err.response?.data?.error || err.message || "Ошибка при сохранении";
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(32, 201, 151, 0.2);
}

.input-disabled {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: var(--success);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-success);
}

.btn.secondary {
  background-color: var(--danger);
  color: #ffffff;
}

.btn.secondary:hover {
  background-color: var(--dark-danger);
}

.btn.danger {
  background-color: #fff0f0;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}

.btn.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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
