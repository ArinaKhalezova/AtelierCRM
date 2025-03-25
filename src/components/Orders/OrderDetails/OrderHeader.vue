<template>
  <div class="header">
    <button @click="$router.push('/orders')" class="btn back">
      ← Назад
    </button>
    <h2>Заказ № {{ order.tracking_number }}</h2>
    <div class="status" :class="order.status.toLowerCase().replace(' ', '-')">
      {{ order.status }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  order: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.status.новый {
  background: #e3f2fd;
  color: #1976d2;
}

.status.в-работе {
  background: #fff8e1;
  color: #ff8f00;
}

.status.готов {
  background: #e8f5e9;
  color: #388e3c;
}

.status.выполнен {
  background: #e8f5e9;
  color: #388e3c;
}

.status.отменен {
  background: #ffebee;
  color: #d32f2f;
}

.btn.back {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  background: transparent;
  color: #1976d2;
}
</style>