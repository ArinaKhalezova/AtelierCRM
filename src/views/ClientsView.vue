<template>
  <div class="clients-view">
    <ClientsList />
  </div>
</template>

<script setup>
import ClientsList from '@/components/Clients/ClientsList.vue';
</script>

<style scoped>
.clients-view {
  background-color: var(--surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}
</style>
