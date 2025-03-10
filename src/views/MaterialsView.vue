<template>
  <div class="materials-view">
    <div class="view-header">
      <h1>Управление материалами</h1>
      <router-link to="/materials/new" class="add-button">
        + Новый материал
      </router-link>
    </div>
    <MaterialList />
  </div>
</template>

<script>
import MaterialList from '@/components/MaterialList.vue'

export default {
  components: {
    MaterialList
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