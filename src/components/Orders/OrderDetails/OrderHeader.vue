<template>
  <div class="header">
    <button @click="goBack" class="btn back">← Назад</button>
    <h2>Заказ № {{ order.tracking_number }}</h2>
    <OrderStatusChanger
      :order-id="order.order_id"
      :current-status="order.status"
    />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import OrderStatusChanger from "../OrderStatusChanger.vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const goBack = () => {
  if (props.isAdmin) {
    router.push("/orders");
  } else {
    router.push("/my-orders");
  }
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.btn.back {
  background: none;
  border: none;
  color: var(--teal);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.btn.back:hover {
  background-color: rgba(139, 170, 173, 0.1);
}

h2 {
  margin: 0;
  color: var(--dark-teal);
  font-size: 1.5rem;
  flex-grow: 1;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.status.новый {
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}
.status.в-работе {
  background-color: rgba(255, 160, 0, 0.2);
  color: #ff8f00;
}
.status.готов {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}
.status.выполнен {
  background-color: rgba(46, 125, 50, 0.2);
  color: #1b5e20;
}
.status.отменен {
  background-color: rgba(220, 53, 69, 0.2);
  color: var(--danger);
}

@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    gap: 1rem;
  }

  h2 {
    width: 100%;
    order: 1;
  }

  .btn.back {
    order: 0;
  }

  .status {
    order: 2;
  }
}
</style>
