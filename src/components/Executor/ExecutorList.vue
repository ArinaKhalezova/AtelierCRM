<template>
  <div class="executor-list">
    <div v-for="executor in executors" :key="executor.id" class="executor-item">
      <p><strong>ФИО:</strong> {{ executor.fullName }}</p>
      <p><strong>Телефон:</strong> {{ executor.phone }}</p>
      <p><strong>Email:</strong> {{ executor.email }}</p>
      <p><strong>Должность:</strong> {{ executor.position }}</p>
      <button @click="deleteExecutor(executor.id)" class="delete-button">Удалить</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['allExecutors']),
    executors() {
      return this.allExecutors;
    }
  },
  methods: {
    ...mapActions(['deleteExecutorAction']),
    deleteExecutor(executorId) {
      if (confirm('Вы уверены, что хотите удалить этого исполнителя?')) {
        this.deleteExecutorAction(executorId);
      }
    }
  }
};
</script>

<style scoped>
.executor-list {
  display: grid;
  gap: 1rem;
}

.executor-item {
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