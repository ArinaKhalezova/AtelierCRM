<template>
  <div class="status-changer">
    <label for="order-status">Статус заказа:</label>
    <select 
      id="order-status" 
      v-model="selectedStatus" 
      @change="updateStatus"
      :disabled="loading"
    >
      <option v-for="status in orderStatuses" :key="status" :value="status">
        {{ status }}
      </option>
    </select>
    <span v-if="loading" class="loading">Обновление...</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  },
  currentStatus: {
    type: String,
    required: true
  }
});

const store = useStore();
const loading = ref(false);
const selectedStatus = ref(props.currentStatus);

const orderStatuses = computed(() => {
  return store.state.orders.orderStatusOptions || [
    'Новый',
    'Принят',
    'В работе',
    'Готов',
    'Выполнен',
    'Отменен'
  ];
});

const updateStatus = async () => {
  loading.value = true;
  try {
    await store.dispatch('orders/updateOrderStatus', {
      orderId: props.orderId,
      status: selectedStatus.value
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.status-changer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--light-gray);
}

.loading {
  font-size: 0.8rem;
  color: var(--warm-gray);
}
</style>