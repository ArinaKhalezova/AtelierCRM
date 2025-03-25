<template>
  <div class="services-view">
    <ServicesList />
  </div>
</template>

<script setup>
import ServicesList from '@/components/Services/ServicesList.vue';
</script>

<style scoped>
.services-view {
  background-color: var(--surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}
</style>
