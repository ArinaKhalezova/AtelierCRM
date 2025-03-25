<template>
  <div class="orders-view">
    <OrderList />
  </div>
</template>

<script setup>
import OrderList from '@/components/Orders/OrderList.vue';
</script>

<style scoped>
.orders-view {
  background-color: var(--surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}
</style>
