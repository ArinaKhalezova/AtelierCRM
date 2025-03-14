<template>
  <div class="material-list">
    <div v-for="material in materials" :key="material.id" class="material-item">
      <p><strong>Наименование:</strong> {{ material.name }}</p>
      <p><strong>Количество:</strong> {{ material.quantity }}</p>
      <p><strong>Цена за единицу:</strong> {{ material.pricePerUnit }} руб.</p>
      <button @click="deleteMaterial(material.id)" class="delete-button">Удалить</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['allMaterials']),
    materials() {
      return this.allMaterials;
    }
  },
  methods: {
    ...mapActions(['deleteMaterialAction']),
    deleteMaterial(materialId) {
      if (confirm('Вы уверены, что хотите удалить этот материал?')) {
        this.deleteMaterialAction(materialId);
      }
    }
  }
};
</script>

<style scoped>
.material-list {
  display: grid;
  gap: 1rem;
}

.material-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button {
  background-color: #f44336;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.delete-button:hover {
  opacity: 0.9;
}
</style>