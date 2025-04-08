<template>
  <div class="timeline-section">
    <h2>Ближайшие события</h2>
    <div class="timeline">
      <div
        v-for="event in upcomingEvents"
        :key="event.id"
        class="timeline-item"
      >
        <div class="timeline-date">{{ formatEventDate(event.date) }}</div>
        <div class="timeline-content">
          <h4>{{ event.title }}</h4>
          <p>Заказ №{{ event.orderNumber }}</p>
          <router-link :to="`/orders/${event.orderId}`">Подробнее</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const upcomingEvents = computed(() => {
  const orders = store.getters["orders/allOrders"];
  return orders
    .filter((order) => order.fitting_date || order.deadline_date)
    .map((order) => ({
      id: order.order_id,
      title: order.fitting_date ? "Примерка" : "Срок выполнения",
      date: order.fitting_date || order.deadline_date,
      orderNumber: order.tracking_number,
      orderId: order.order_id,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Показываем только 5 ближайших
});

const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  try {
    store.dispatch("orders/fetchOrders");
    store.dispatch("orders/fetchOrdersCountByStatus");
  } catch (e) {
    console.error("Component mount error:", e);
  }
});
</script>

<style scoped>
.timeline-section {
  margin-top: 3rem;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.timeline-section h2 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
}

.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--teal);
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--teal);
}

.timeline-date {
  font-weight: 500;
  color: var(--dark-teal);
  margin-bottom: 0.5rem;
}

.timeline-content {
  background: rgba(139, 170, 173, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.timeline-content h4 {
  margin: 0 0 0.5rem;
  color: var(--dark-teal);
}

.timeline-content p {
  margin: 0 0 0.5rem;
  color: var(--warm-gray);
}

.timeline-content a {
  color: var(--teal);
  text-decoration: none;
  font-size: 0.9rem;
}
</style>
