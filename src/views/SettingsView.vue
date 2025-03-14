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

    <!-- Статус заказов -->
    <div class="settings-section">
      <h2>Статус заказа</h2>
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
      <input v-model="newstatuses" placeholder="Новый статус заказа" />
      <button @click="addStatus" class="add-button">Добавить</button>
    </div>

    <!-- Тип материалов -->
    <div class="settings-section">
      <h2>Тип материала</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div
        v-for="materialType in materialTypes"
        :key="materialType.material_type_id"
        class="settings-item"
      >
        <p><strong>Тип:</strong> {{ materialType.type_name }}</p>
        <button
          @click="deleteMaterialType(materialType.material_type_id)"
          class="delete-button"
        >
          Удалить
        </button>
      </div>
      <input v-model="newMaterialTypes" placeholder="Новый тип материала" />
      <button @click="addMaterialType" class="add-button">Добавить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newJobPosition = ref("");
const newstatuses = ref("");
const newMaterialTypes = ref("");

const error = ref("");

// Получаем данные из Vuex store
const jobPositions = computed(() => store.getters.jobPositions);
const statuses = computed(() => store.getters.statuses);
const materialTypes = computed(() => store.getters.materialTypes);

// Добавление должности
const addJobPosition = async () => {
  if (newJobPosition.value.trim()) {
    try {
      await store.dispatch("addJobPositionAction", {
        position_name: newJobPosition.value,
      });
      console.log("New job position added:", newJobPosition.value);
      newJobPosition.value = ""; // Очищаем поле ввода
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при добавлении должности";
    }
  } else {
    error.value = "Название должности не может быть пустым";
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

// Добавление статуса
const addStatus = async () => {
  if (newstatuses.value.trim()) {
    try {
      await store.dispatch("addStatusAction", {
        status: newstatuses.value,
      });
      console.log("New status added:", newstatuses.value);
      newstatuses.value = ""; // Очищаем поле ввода
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при добавлении статуса";
    }
  } else {
    error.value = "Название статуса не может быть пустым";
  }
};

// Удаление статуса
const deleteStatus = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот статус?")) {
    try {
      await store.dispatch("deleteStatusAction", id);
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при удалении статуса";
    }
  }
};

// Добавление типа материала
const addMaterialType = async () => {
  if (newMaterialTypes.value.trim()) {
    try {
      await store.dispatch("addMaterialTypeAction", {
        type_name: newMaterialTypes.value,
      });
      console.log("New material type added:", newMaterialTypes.value);
      newMaterialTypes.value = ""; // Очищаем поле ввода
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при добавлении типа материала";
    }
  } else {
    error.value = "Название типа не может быть пустым";
  }
};

// Удаление типа материала
const deleteMaterialType = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот тип?")) {
    try {
      await store.dispatch("deleteMaterialTypeAction", id);
      error.value = ""; // Очищаем ошибку
    } catch (err) {
      error.value = "Ошибка при удалении типа";
    }
  }
};

// Загружаем данные
onMounted(async () => {
  try {
    await store.dispatch("fetchJobPositions");
    await store.dispatch("fetchStatuses");
    await store.dispatch("fetchMaterialTypes");
    console.log("Job positions data:", store.getters.jobPositions);
    console.log("Statuses data:", store.getters.statuses);
    console.log("MaterialTypes data:", store.getters.materialTypes);
  } catch (err) {
    error.value = "Ошибка при загрузке";
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
