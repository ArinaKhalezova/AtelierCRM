<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Редактирование заказа #{{ order.order_id }}</h2>

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
            />
          </div>
        </div>

        <div class="form-section">
          <h3>Примерки</h3>

          <div
            v-for="(fitting, index) in formData.fittings"
            :key="index"
            class="fitting-item"
          >
            <div class="form-group">
              <label>Дата примерки #{{ index + 1 }}:</label>
              <input
                type="date"
                v-model="fitting.date"
                :min="minFittingDate"
                class="input"
              />
            </div>

            <div class="form-group">
              <label>Результат:</label>
              <textarea
                v-model="fitting.result"
                rows="3"
                class="textarea"
              ></textarea>
            </div>

            <button
              v-if="formData.fittings.length > 1"
              type="button"
              @click="removeFitting(index)"
              class="btn danger small"
            >
              Удалить
            </button>
          </div>

          <button type="button" @click="addFitting" class="btn secondary">
            Добавить примерку
          </button>
        </div>

        <div class="form-section">
          <h3>Комментарий</h3>
          <div class="comment-preview" v-if="formattedCommentPreview.length">
            <div
              v-for="(part, i) in formattedCommentPreview"
              :key="i"
              class="comment-part"
              :class="{ 'fitting-part': part.type === 'fitting' }"
            >
              <div v-if="part.type === 'text'">{{ part.content }}</div>
              <div v-else>
                <div class="fitting-header">{{ part.header }}</div>
                <div class="fitting-content">{{ part.content }}</div>
              </div>
            </div>
          </div>
          <textarea
            v-model="formData.comment"
            rows="4"
            class="textarea"
            placeholder="Введите комментарий..."
          ></textarea>
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
const formData = ref(initializeFormData());
const isSubmitting = ref(false);
const error = ref(null);

function initializeFormData() {
  if (!props.order) return { fittings: [], comment: "" };

  // Сохраняем ВСЕ оригинальные данные из заказа
  const initialData = {
    deadline_date: formatDateForInput(props.order.deadline_date), // Оригинальная дата завершения
    comment: props.order.comment || "",
    created_at: props.order.created_at, // Оригинальная дата создания
    fittings: [],
    original_fitting_date: props.order.fitting_date, // Сохраняем оригинальную дату примерки
  };

  // Парсим примерки, сохраняя оригинальные данные
  let commentWithoutFittings = initialData.comment;

  // 1. Добавляем основную примерку из fitting_date заказа
  if (props.order.fitting_date) {
    initialData.fittings.push({
      date: props.order.fitting_date, // Оригинальная дата
      result: "",
      isOriginal: true, // Помечаем как оригинальную
    });
  }

  // 2. Парсим дополнительные примерки из комментария
  if (initialData.comment && initialData.comment.includes("--- Примерки ---")) {
    const [commentPart, fittingsPart] =
      initialData.comment.split("--- Примерки ---");
    commentWithoutFittings = commentPart.trim();

    // Проверяем, что fittingsPart существует и не пуст
    if (fittingsPart && fittingsPart.trim()) {
      const fittingBlocks = fittingsPart.split("Примерка #").filter(Boolean); // Удаляем пустые строки

      fittingBlocks.forEach((block) => {
        const [header, ...contentParts] = block.split(":");
        const dateMatch = header?.match(/\(([^)]+)\)/); // Добавляем ?. на случай undefined
        const result = contentParts?.join(":").trim() || "";

        if (dateMatch?.[1]) {
          // Проверяем, что дата найдена
          initialData.fittings.push({
            date: dateMatch[1].trim(),
            result: result,
            isOriginal: true,
          });
        }
      });
    }
  }

//   // Если нет ни одной примерки - добавляем пустую
//   if (initialData.fittings.length === 0) {
//     initialData.fittings.push({ date: "", result: "" });
//   }

  return {
    ...initialData,
    comment: commentWithoutFittings,
    // Сохраняем все оригинальные даты
    originalDates: {
      created_at: props.order.created_at,
      deadline_date: props.order.deadline_date,
      fitting_date: props.order.fitting_date,
    },
  };
}

const formattedCommentPreview = computed(() => {
  const parts = [];

  if (!formData.value) return parts;

  if (formData.value.comment?.trim()) {
    parts.push({
      type: "text",
      content: formData.value.comment.trim(),
    });
  }

  if (formData.value.fittings?.some((f) => f?.date || f?.result)) {
    formData.value.fittings.forEach((fitting, index) => {
      if (fitting?.date || fitting?.result) {
        parts.push({
          type: "fitting",
          header: `Примерка #${index + 1} (${fitting.date})`,
          content: fitting.result,
        });
      }
    });
  }

  return parts;
});

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Корректировка для часового пояса
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split("T")[0];
}

const minDeadlineDate = computed(() => {
  return formatDateForInput(formData.value.created_at);
});

const minFittingDate = computed(() => {
  return formatDateForInput(new Date());
});

watch(
  () => props.order,
  (newOrder) => {
    formData.value = initializeFormData();
  },
  { deep: true }
);

const addFitting = () => {
  formData.value.fittings.push({ date: "", result: "" });
};

const removeFitting = (index) => {
  formData.value.fittings.splice(index, 1);
};

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

  // Проверка даты завершения
  if (deadline < created) {
    error.value = "Дата завершения не может быть раньше даты создания";
    return false;
  }

  // Проверка дат примерок
  for (const fitting of formData.value.fittings) {
    if (fitting.date) {
      const fittingDate = new Date(fitting.date);
      fittingDate.setHours(0, 0, 0, 0);

      if (fittingDate < today) {
        error.value = "Дата примерки не может быть раньше сегодняшнего дня";
        return false;
      }

      if (fittingDate >= deadline) {
        error.value = "Дата примерки должна быть раньше даты завершения";
        return false;
      }
    }
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateDates()) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    // Формируем полный комментарий
    let fullComment = formData.value.comment.trim();

    const validFittings = formData.value.fittings.filter(
      (f) => f.date || f.result
    );
    if (validFittings.length > 0) {
      if (fullComment) fullComment += "\n\n";
      fullComment += "--- Примерки ---";

      validFittings.forEach((fitting, index) => {
        fullComment += `\n\nПримерка #${index + 1} (${fitting.date}):\n${
          fitting.result
        }`;
      });
    }

    const orderData = {
      deadline_date: formData.value.deadline_date,
      // Сохраняем первую примерку в отдельное поле
      fitting_date: validFittings[0]?.date || null,
      comment: fullComment.trim(),
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

.fitting-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  position: relative;
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
  background-color: var(--teal);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-teal);
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
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

.comment-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #ddd;
}

.comment-part {
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.fitting-part {
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 4px;
  margin-top: 1rem;
}

.fitting-header {
  font-weight: 500;
  color: var(--teal);
  margin-bottom: 0.5rem;
}

.fitting-content {
  white-space: pre-wrap;
  color: #444;
}
</style>
