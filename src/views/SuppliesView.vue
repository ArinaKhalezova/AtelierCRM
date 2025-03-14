<template>
  <div class="supplies-view">
    <div class="view-header">
      <h1>Управление поставками</h1>
      <router-link to="/supplies/new" class="add-button">
        + Новая поставка
      </router-link>
    </div>
    <SupplyList />
  </div>
</template>

<script>
import SupplyList from "@/components/Supply/SupplyList.vue";

export default {
  components: {
    SupplyList,
  },
};
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
