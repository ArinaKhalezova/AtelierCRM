<template>
  <div class="executors-view">
    <div class="view-header">
      <h1>Управление исполнителями</h1>
      <router-link to="/executors/new" class="add-button">
        + Новый исполнитель
      </router-link>
    </div>
    <ExecutorList />
  </div>
</template>

<script>
import ExecutorList from '@/components/ExecutorList.vue'

export default {
  components: {
    ExecutorList
  }
}
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