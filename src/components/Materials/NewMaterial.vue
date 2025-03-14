<template>
  <div class="new-material">
    <h2>Добавить новый материал</h2>
    <form @submit.prevent="addMaterial">
      <div class="form-group">
        <label>Наименование:</label>
        <input v-model="newMaterial.name" required>
      </div>
      <div class="form-group">
        <label>Номер поставки:</label>
        <input v-model="newMaterial.supplyNumber" required>
      </div>
      <div class="form-group">
        <label>Тип единицы:</label>
        <select v-model="newMaterial.unitType" required>
          <option value="шт">Штуки</option>
          <option value="метры">Метры</option>
          <option value="упаковка">Упаковка</option>
        </select>
      </div>
      <div class="form-group">
        <label>Цена за единицу:</label>
        <input type="number" v-model="newMaterial.pricePerUnit" required>
      </div>
      <button type="submit">Добавить материал</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      newMaterial: {
        name: '',
        supplyNumber: '',
        unitType: 'шт',
        pricePerUnit: 0
      }
    };
  },
  methods: {
    ...mapActions(['addMaterialAction']),
    addMaterial() {
      this.addMaterialAction(this.newMaterial);
      this.$router.push('/materials');
    }
  }
};
</script>

<style scoped>
.new-material {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color);
}
</style>