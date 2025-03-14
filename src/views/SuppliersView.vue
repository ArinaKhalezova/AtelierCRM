<template>
  <div class="suppliers-view">
    <div class="view-header">
      <h1>Управление поставщиками</h1>
      <router-link to="/suppliers/new" class="add-button">
        + Новый поставщик
      </router-link>
    </div>
    <SupplierList />
  </div>
</template>

<script>
import SupplierList from "@/components/Supplier/SupplierList.vue";

export default {
  components: {
    SupplierList,
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
