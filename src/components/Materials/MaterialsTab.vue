<template>
  <div class="materials-tab">
    <div class="header-section">
      <h2>Управление материалами</h2>
      <button @click="showAddModal = true" class="add-button">
        + Добавить материал
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="materials-grid">
      <div
        v-for="material in materials"
        :key="material.material_id"
        class="material-card"
      >
        <div class="card-content">
          <h3>{{ material.material_name }}</h3>
          <div class="material-properties">
            <div class="property">
              <span class="label">Тип:</span>
              <span class="value">{{ material.type }}</span>
            </div>
            <div class="property">
              <span class="label">Ед. измерения:</span>
              <span class="value">{{ material.unit }}</span>
            </div>
            <div class="property">
              <span class="label">Количество:</span>
              <span class="value">{{ material.quantity }}</span>
            </div>
            <div class="property">
              <span class="label">Цена за ед.:</span>
              <span class="value">{{ material.cost_per_unit }} ₽</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button @click="openEditModal(material)" class="edit-button">
            Редактировать
          </button>
          <button
            @click="deleteMaterial(material.material_id)"
            class="delete-button"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <MaterialModal
      v-if="showAddModal || selectedMaterial"
      :material="selectedMaterial"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import MaterialModal from "@/components/Materials/MaterialModal.vue";

const store = useStore();
const showAddModal = ref(false);
const selectedMaterial = ref(null);

const materials = computed(() => store.state.materials.materials);
const error = computed(() => store.state.materials.error);

onMounted(async () => {
  try {
    await store.dispatch("materials/fetchMaterials");
  } catch (err) {
    store.commit("materials/setError", "Ошибка загрузки материалов");
  }
});

const openEditModal = (material) => {
  selectedMaterial.value = { ...material };
};

const closeModal = () => {
  showAddModal.value = false;
  selectedMaterial.value = null;
};

const handleSave = async (materialData) => {
  try {
    if (materialData.material_id) {
      await store.dispatch("materials/updateMaterial", materialData);
    } else {
      await store.dispatch("materials/addMaterial", materialData);
    }
    closeModal();
  } catch (error) {
    console.error("Ошибка сохранения:", error);
  }
};

const deleteMaterial = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить материал?")) return;

  try {
    await store.dispatch("materials/deleteMaterial", id);
    // Обновляем список после удаления
    await store.dispatch("materials/fetchMaterials");
  } catch (error) {
    console.error("Ошибка удаления:", error.response?.data || error.message);
    store.commit(
      "materials/SET_ERROR",
      error.response?.data?.message || "Ошибка при удалении материала"
    );
  }
};
</script>

<style scoped>
.materials-tab {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-button {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.add-button:hover {
  background-color: #3aa876;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.material-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 1.5rem;
}

.material-properties {
  margin-top: 1rem;
}

.property {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid #eee;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  margin-top: auto;
}

.edit-button {
  background-color: #f0ad4e;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.delete-button {
  background-color: #d9534f;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.error-message {
  color: #d9534f;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
