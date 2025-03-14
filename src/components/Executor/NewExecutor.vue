<template>
  <div class="new-executor">
    <h2>Добавить нового сотрудника</h2>
    <form @submit.prevent="addExecutor">
      <div class="form-group">
        <label for="fullName">ФИО:</label>
        <input type="text" id="fullName" v-model="newExecutor.fullName" required>
      </div>
      <div class="form-group">
        <label for="phone">Телефон:</label>
        <input type="text" id="phone" v-model="newExecutor.phone" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="newExecutor.email" required>
      </div>
      <div class="form-group">
        <label for="position">Должность:</label>
        <input type="text" id="position" v-model="newExecutor.position" required>
      </div>
      <button type="submit">Добавить сотрудника</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      newExecutor: {
        fullName: '',
        phone: '',
        email: '',
        position: ''
      }
    };
  },
  methods: {
    ...mapActions(['addExecutorAction']),
    addExecutor() {
      this.addExecutorAction(this.newExecutor);
      this.$router.push('/executors');
    }
  }
};
</script>

<style scoped>
.new-executor {
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