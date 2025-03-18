<template>
  <details class="settings-section">
    <summary class="settings_header"><h2>Статусы заказа</h2></summary>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div
      v-for="status in statuses"
      :key="status.status_id"
      class="settings-item"
    >
      <p><strong>Статус:</strong> {{ status.status }}</p>
      <button @click="deleteStatus(status.status_id)" class="delete-button">
        Удалить
      </button>
    </div>
    <input v-model="newStatus" placeholder="Новый статус заказа" />
    <button @click="addStatus" class="add-button">Добавить</button>
  </details>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newStatus = ref("");
const error = ref("");

const statuses = computed(() => store.state.statuses.statuses);

const addStatus = async () => {
  if (newStatus.value.trim()) {
    try {
      await store.dispatch("statuses/addStatusAction", {
        status: newStatus.value,
      });
      newStatus.value = "";
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при добавлении статуса";
    }
  } else {
    error.value = "Название статуса не может быть пустым";
  }
};

const deleteStatus = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот статус?")) {
    try {
      await store.dispatch("statuses/deleteStatusAction", id);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении статуса";
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 10px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.add-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.settings-section {
  margin-bottom: 20px;
}

.settings_header {
  display: flex;
  justify-content: center;
}

details {
  background-color: rgba(255, 255, 255, 0.71);
  border: 1px solid none;
  padding: 10px;
  border-radius: 20px;
}

summary {
  cursor: pointer;
  font-weight: bold;
}

details[open] summary {
  margin-bottom: 10px;
}
</style>
