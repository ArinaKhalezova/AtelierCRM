<template>
  <details class="settings-section">
    <summary class="settings_header"><h2>Должности</h2></summary>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div
      v-for="position in jobPositions"
      :key="position.job_position_id"
      class="settings-item"
    >
      <p><strong>Название:</strong> {{ position.position_name }}</p>
      <button
        @click="deleteJobPosition(position.job_position_id)"
        class="delete-button"
      >
        Удалить
      </button>
    </div>
    <input v-model="newJobPosition" placeholder="Новая должность" />
    <button @click="addJobPosition" class="add-button">Добавить</button>
  </details>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newJobPosition = ref("");
const error = computed(() => store.state.jobPositions.error);

const jobPositions = computed(() => store.state.jobPositions.jobPositions);

const addJobPosition = async () => {
  if (newJobPosition.value.trim()) {
    try {
      await store.dispatch("jobPositions/addJobPositionAction", {
        position_name: newJobPosition.value,
      });
      newJobPosition.value = "";
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при добавлении должности";
    }
  } else {
    error.value = "Название должности не может быть пустым";
  }
};

const deleteJobPosition = async (id) => {
  if (confirm("Вы уверены, что хотите удалить эту должность?")) {
    try {
      await store.dispatch("jobPositions/deleteJobPositionAction", id);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении должности";
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
