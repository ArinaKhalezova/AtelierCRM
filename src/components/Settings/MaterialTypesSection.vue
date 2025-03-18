<template>
  <details class="settings-section">
    <summary class="settings_header"><h2>Тип материала</h2></summary>
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
  </details>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newMaterialTypes = ref("");
const error = ref("");

const materialTypes = computed(() => store.state.materialTypes.materialTypes);

const addMaterialType = async () => {
  if (newMaterialTypes.value.trim()) {
    try {
      await store.dispatch("materialTypes/addMaterialTypeAction", {
        type_name: newMaterialTypes.value,
      });
      newMaterialTypes.value = "";
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при добавлении типа материала";
    }
  } else {
    error.value = "Название типа не может быть пустым";
  }
};

const deleteMaterialType = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот тип?")) {
    try {
      await store.dispatch("materialTypes/deleteMaterialTypeAction", id);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении типа";
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
