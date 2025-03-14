<template>
  <div class="new-supplier">
    <h2>Добавить нового поставщика</h2>
    <form @submit.prevent="addSupplier">
      <div class="form-group">
        <label>Название организации:</label>
        <input v-model="newSupplier.name" required>
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input v-model="newSupplier.phone" required>
      </div>
      <div class="form-group">
        <label>Адрес:</label>
        <input v-model="newSupplier.address" required>
      </div>
      <div class="form-group">
        <label>ИНН:</label>
        <input v-model="newSupplier.inn" required>
      </div>
      <button type="submit">Добавить поставщика</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      newSupplier: {
        name: '',
        phone: '',
        address: '',
        inn: ''
      }
    };
  },
  methods: {
    ...mapActions(['addSupplierAction']),
  addSupplier() {
    // Преобразуем данные при необходимости
    const newSupplier = { 
      ...this.newSupplier,
      inn: String(this.newSupplier.inn) // Пример преобразования данных
    };
    this.addSupplierAction(newSupplier);
    this.$router.push('/suppliers');
  }
  }
};
</script>

<style scoped>
.new-supplier {
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

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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