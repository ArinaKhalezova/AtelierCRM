<template>
  <div class="fittings-section">
    <h3 class="section-title">Примерки</h3>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <template v-else>
      <div v-if="fittings.length === 0" class="no-items">
        Нет запланированных примерок
      </div>

      <div v-else class="items-list">
        <div
          v-for="fitting in fittings"
          :key="fitting.fitting_id"
          class="item-card"
        >
          <div class="item-header">
            <span class="item-date">
              {{ formatDate(fitting.fitting_date) }}
            </span>
            <span class="item-status" :class="{ 'no-result': !fitting.result }">
              {{ fitting.result || "Результат не указан" }}
            </span>
          </div>
          <div v-if="fitting.notes" class="item-notes">
            {{ fitting.notes }}
          </div>

          <div class="item-actions" v-if="canEdit">
            <button @click="editFitting(fitting)" class="btn small secondary">
              <i class="icon-edit"></i> Редактировать
            </button>
            <button
              @click="deleteFitting(fitting.fitting_id)"
              class="btn small danger"
            >
              <i class="icon-delete"></i> Удалить
            </button>
          </div>
        </div>
      </div>

      <button v-if="canEdit" @click="addFitting" class="btn primary">
        <i class="icon-add"></i> Добавить примерку
      </button>
    </template>

    <FittingModal
      v-if="showModal"
      :is-open="showModal"
      :fitting="currentFitting"
      :order-id="orderId"
      @close="closeModal"
      @save="handleSaveFitting"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import FittingModal from "./FittingModal.vue";

const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();
const showModal = ref(false);
const currentFitting = ref(null);

const fittings = computed(() => store.state.fittings.fittings);
const isLoading = computed(() => store.state.fittings.isLoading);
const error = computed(() => store.state.fittings.error);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const addFitting = () => {
  currentFitting.value = null;
  showModal.value = true;
};

const editFitting = (fitting) => {
  currentFitting.value = { ...fitting };
  showModal.value = true;
};

const deleteFitting = async (fittingId) => {
  if (confirm("Вы уверены, что хотите удалить эту примерку?")) {
    try {
      await store.dispatch("fittings/deleteFitting", fittingId);
    } catch (error) {
      console.error("Ошибка удаления примерки:", error);
    }
  }
};

const closeModal = () => {
  showModal.value = false;
};

const handleSaveFitting = async (fittingData) => {
  try {
    if (fittingData.fitting_id) {
      await store.dispatch("fittings/updateFitting", {
        fittingId: fittingData.fitting_id,
        fittingData: {
          fitting_date: fittingData.fitting_date,
          result: fittingData.result,
          notes: fittingData.notes,
        },
      });
    } else {
      await store.dispatch("fittings/addFitting", {
        orderId: props.orderId,
        fittingData,
      });
    }
    closeModal();
  } catch (error) {
    console.error("Ошибка сохранения примерки:", {
      message: error.message,
      response: error.response?.data,
    });
  }
};

onMounted(() => {
  store.dispatch("fittings/fetchOrderFittings", props.orderId);
});
</script>

<style scoped>
.fittings-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.section-title {
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.25rem;
  font-weight: 600;
}

.no-items {
  padding: 1rem;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 6px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  padding: 1.25rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.item-date {
  color: #333;
}

.item-status {
  color: var(--teal);
  font-weight: 600;
}

.item-status.no-result {
  color: #999;
  font-style: italic;
  font-weight: normal;
}

.item-notes {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.5rem 0;
}

.item-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background-color: var(--info);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-info);
}

.btn.secondary {
  background-color: var(--info);
  color: #ffffff;
}

.btn.secondary:hover {
  background-color: var(--dark-info);
}

.btn.danger {
  background-color: white;
  border: 1px solid var(--danger);
  color: var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}

.btn.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.error-message {
  padding: 1rem;
  color: var(--danger);
  background-color: #fff0f0;
  border-radius: 6px;
  text-align: center;
}

.icon-add,
.icon-edit,
.icon-delete {
  font-size: 1rem;
}
</style>
