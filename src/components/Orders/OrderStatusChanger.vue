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

const availableStatuses = [
  "Новый",
  "Принят",
  "В работе",
  "Готов",
  "Выполнен",
  "Отменен",
];

const updateStatus = async () => {
  try {
    isLoading.value = true;

    await store.dispatch("orders/updateOrderStatus", {
      orderId: props.orderId,
      status: selectedStatus.value,
    });

    // Обновляем историю заказа
    await store.dispatch("orderDetails/fetchOrderHistory", props.orderId);

    emit("status-updated");
  } catch (error) {
    console.error("Ошибка обновления статуса заказа:", error);
    selectedStatus.value = props.currentStatus;
    store.commit("orders/SET_ERROR", error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

.status-select {
  padding: 10px 20px;
  text-align: center;
  border-radius: 1rem;
  border: 1px solid;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
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
  background-color: rgb(186, 216, 220);
  color: #ffffff;
}
.status-принят {
  background-color: rgb(158, 230, 172);
  color: #ffffff;
}
.status-в-работе {
  background-color: rgb(255, 190, 77);
  color: #ffffff;
}
.status-готов {
  background-color: rgb(48, 194, 89);
  color: #ffffff;
}
.status-выполнен {
  background-color: rgb(15, 159, 82);
  color: #ffffff;
}
.status-отменен {
  background-color: rgb(139, 18, 18);
  color: white;
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
