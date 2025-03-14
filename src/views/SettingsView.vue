<template>
  <div class="settings-view">
    <!-- Должности -->
    <div class="settings-section">
      <h2>Должности</h2>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const newJobPosition = ref("");
const error = ref("");

// Получаем jobPositions из Vuex store
const jobPositions = computed(() => store.getters.jobPositions);

// Добавление должности
const addJobPosition = async () => {
  if (newJobPosition.value.trim()) {
    try {
      await store.dispatch('addJobPositionAction', {
        position_name: newJobPosition.value,
      });
      console.log("New job position added:", newJobPosition.value); // Добавьте эту строку
      newJobPosition.value = ''; // Очищаем поле ввода
      error.value = ''; // Очищаем ошибку
    } catch (err) {
      error.value = 'Ошибка при добавлении должности';
    }
  } else {
    error.value = 'Название должности не может быть пустым';
  }
};

// Удаление должности
const deleteJobPosition = async (id) => {
  if (confirm("Вы уверены, что хотите удалить эту должность?")) {
    try {
      await store.dispatch("deleteJobPositionAction", id);
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при удалении должности";
    }
  }
};

// Загружаем должности при монтировании компонента
onMounted(async () => {
  try {
    await store.dispatch("fetchJobPositions");
    console.log("Job positions data:", store.getters.jobPositions); // Добавьте эту строку
  } catch (err) {
    error.value = "Ошибка при загрузке должностей";
  }
});
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
</style>
