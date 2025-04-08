<template>
  <div class="status-changer">
    <select
      v-model="selectedStatus"
      @change="updateStatus"
      class="status-select"
      :class="`status-${selectedStatus.toLowerCase().replace(' ', '-')}`"
    >
      <option
        v-for="status in availableStatuses"
        :key="status"
        :value="status"
        :class="`status-${status.toLowerCase().replace(' ', '-')}`"
      >
        {{ status }}
      </option>
    </select>
    <span v-if="isLoading" class="loading-indicator"></span>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["status-updated"]);

const store = useStore();
const isLoading = ref(false);
const selectedStatus = ref(props.currentStatus);

const availableStatuses = ["Новый", "В работе", "Готов", "Выполнен", "Отменен"];

const updateServiceStatus = async () => {
  try {
    isLoading.value = true;
    await store.dispatch(
      "orderDetails/updateOrderServiceStatus",
      {
        serviceId: props.serviceId,
        status: selectedStatus.value,
      },
      { root: true }
    );

    // Принудительно обновляем историю после изменения
    await store.dispatch(
      "orderDetails/fetchOrderServiceHistory",
      store.getters["orderDetails/currentOrder"]?.order_id,
      { root: true }
    );

    emit("status-updated");
  } catch (error) {
    console.error("Ошибка обновления статуса:", error);
    selectedStatus.value = props.currentStatus;
    // Показываем ошибку пользователю
    store.commit("SET_ERROR", error.message, { root: true });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.status-changer {
  position: relative;
  display: flex;
  align-items: center;
}

.status-select {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  padding-right: 2rem;
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
  transition: all 0.2s ease;
}

.status-select:hover {
  opacity: 0.9;
}

.status-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.3);
}

.loading-indicator {
  position: absolute;
  right: 0.75rem;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid var(--teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Status colors */
.status-новый {
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}
.status-в-работе {
  background-color: rgba(255, 160, 0, 0.2);
  color: #ff8f00;
}
.status-готов {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}
.status-выполнен {
  background-color: rgba(46, 125, 50, 0.2);
  color: #1b5e20;
}
.status-отменен {
  background-color: rgba(220, 53, 69, 0.2);
  color: var(--danger);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
