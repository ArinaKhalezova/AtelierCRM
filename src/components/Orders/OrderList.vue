<template>
  <div class="order-list">
    <div class="header">
      <h2>Список заказов</h2>
      <router-link to="/orders/new" class="btn primary">
        + Новый заказ
      </router-link>
    </div>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="empty">Нет заказов</div>
    <div v-else class="list">
      <div v-for="order in orders" :key="order.order_id" class="order-item">
        <div class="info">
          <div class="tracking">№ {{ order.tracking_number }}</div>
          <div class="client">{{ order.client_name }}</div>
          <div class="status" :class="order.status.toLowerCase()">
            {{ order.status }}
          </div>
          <div class="deadline">
            Срок: {{ formatDate(order.deadline_date) }}
          </div>
          <div class="cost">{{ order.total_cost }} ₽</div>
        </div>
        <div class="actions">
          <router-link :to="`/orders/${order.order_id}`" class="btn outline">
            Подробнее
          </router-link>
          <button @click="deleteOrder(order.order_id)" class="btn danger">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const orders = computed(() => store.getters["orders/allOrders"]);
const isLoading = computed(() => store.getters["orders/isLoading"]);
const error = computed(() => store.getters["orders/error"]);

onMounted(() => {
  store.dispatch("orders/fetchOrders");
});

const formatDate = (dateString) => {
  if (!dateString) return "Не указан";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

const deleteOrder = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
    const success = await store.dispatch("orders/deleteOrder", id);
    if (!success) {
      alert("Не удалось удалить заказ. Подробности в консоли.");
    }
  }
};
</script>

<style scoped>
.order-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list {
  display: grid;
  gap: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  align-items: center;
  flex: 1;
}

.tracking {
  font-weight: bold;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

.status.new {
  background: #e3f2fd;
  color: #1976d2;
}

.status.in-progress {
  background: #fff8e1;
  color: #ff8f00;
}

.status.completed {
  background: #e8f5e9;
  color: #388e3c;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background: #1976d2;
  color: white;
}

.btn.outline {
  background: transparent;
  border: 1px solid #1976d2;
  color: #1976d2;
}

.btn.danger {
  background: #d32f2f;
  color: white;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.error {
  color: #d32f2f;
}
</style>
