<template>
  <div class="order-list">
    <div v-for="order in orders" :key="order.id" class="order-item">
      <div class="order-info">
        <p class="client-name">{{ order.clientName }}</p>
        <p class="status">{{ order.status }}</p>
        <p class="date">Принят: {{ formattedDate(order.receptionDate) }}</p>
      </div>
      <router-link :to="`/orders/${order.id}`" class="details-button">
        Подробнее
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['orders'])
  },
  methods: {
    formattedDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.order-list {
  display: grid;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-info {
  flex-grow: 1;
}

.client-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.status {
  color: #666;
  font-size: 0.9rem;
}

.date {
  color: #888;
  font-size: 0.8rem;
}

.details-button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.details-button:hover {
  background-color: var(--primary-color);
}
</style>