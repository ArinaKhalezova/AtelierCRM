<template>
  <div class="materials-view">
    <ServicesList />
  </div>
</template>

<script setup>
import ServicesList from '@/components/Services/ServicesList.vue';
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-button {
  background-color: var(--secondary-color);
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: var(--primary-color);
}
</style>
