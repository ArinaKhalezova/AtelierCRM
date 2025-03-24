<template>
  <div class="clients-view">
    <ClientsList />
  </div>
</template>

<script setup>
import ClientsList from '@/components/Clients/ClientsList.vue';
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
