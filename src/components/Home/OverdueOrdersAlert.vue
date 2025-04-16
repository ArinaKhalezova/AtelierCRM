<template>
  <div v-if="overdueOrders.length > 0" class="overdue-alert">
    <div class="alert-header">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="alert-icon"
      >
        <path
          d="M12 9V11M12 15H12.01M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <h3>Просроченные заказы</h3>
      <span class="badge">{{ overdueOrders.length }}</span>
    </div>

    <div class="order-list">
      <div
        v-for="order in overdueOrders"
        :key="order.order_id"
        class="order-item"
      >
        <div class="order-info">
          <div class="order-number">№ {{ order.tracking_number }}</div>
          <div class="client-name">{{ order.client_name }}</div>
          <div class="deadline">
            Должен быть готов: {{ formatDate(order.deadline_date) }}
          </div>
        </div>
        <div class="order-actions">
          <router-link :to="`/orders/${order.order_id}`" class="action-link">
            Перейти к заказу
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const overdueOrders = ref([]);

const formatDate = (dateString) => {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

onMounted(async () => {
  try {
    await store.dispatch("orders/fetchOverdueOrders");
    overdueOrders.value = store.state.orders.orders;
  } catch (error) {
    console.error("Ошибка загрузки просроченных заказов:", error);
  }
});
</script>

<style scoped>
.overdue-alert {
  background-color: #fff4f4;
  border: 1px solid #ffd6d6;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-sm);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: var(--danger);
}

.alert-icon {
  color: var(--danger);
}

.alert-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.badge {
  background-color: var(--danger);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
}

.order-info {
  flex: 1;
}

.order-number {
  font-weight: 500;
  color: var(--dark-teal);
}

.client-name {
  font-size: 0.9rem;
  color: var(--warm-gray);
  margin-top: 0.25rem;
}

.deadline {
  font-size: 0.85rem;
  color: var(--danger);
  margin-top: 0.25rem;
}

.action-link {
  color: var(--teal);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: rgba(139, 170, 173, 0.1);
  transition: all 0.2s;
}

.action-link:hover {
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}

@media (max-width: 768px) {
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-actions {
    align-self: flex-end;
  }
}
</style>
