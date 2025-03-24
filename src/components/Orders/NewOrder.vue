<template>
  <div class="new-order">
    <h2>Добавить новый заказ</h2>
    <form @submit.prevent="addOrder">
      <div class="form-group">
        <label for="clientName">ФИО клиента:</label>
        <input type="text" id="clientName" v-model="newOrder.clientName" required>
      </div>
      <div class="form-group">
        <label for="receptionDate">Дата приема:</label>
        <input type="date" id="receptionDate" v-model="newOrder.receptionDate" required>
      </div>
      <div class="form-group">
        <label for="completionDate">Срок выполнения:</label>
        <input type="date" id="completionDate" v-model="newOrder.completionDate" required>
      </div>
      <div class="form-group">
        <label for="cost">Стоимость:</label>
        <input type="number" id="cost" v-model="newOrder.cost" required>
      </div>
      <div class="form-group">
        <label for="status">Статус:</label>
        <select id="status" v-model="newOrder.status" required>
          <option value="взять в работу">Взять в работу</option>
        </select>
      </div>
      <button type="submit">Добавить заказ</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      newOrder: {
        clientName: '',
        receptionDate: '',
        completionDate: '',
        cost: 0,
        status: 'взять в работу'
      }
    };
  },
  methods: {
    ...mapActions(['addOrderAction']),
    addOrder() {
      this.addOrderAction(this.newOrder);
      this.$router.push('/orders');
    }
  }
};
</script>

<style scoped>
.new-order {
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
  margin-bottom: 1rem;
}

button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color);
}
</style>