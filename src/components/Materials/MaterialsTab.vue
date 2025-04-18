<template>
  <div class="materials-tab">
    <div class="header">
      <h2>Материалы</h2>
      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Поиск материалов..." />
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="table-wrapper">
      <table class="materials-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Ед. измерения</th>
            <th>Количество</th>
            <th>Цена за ед.</th>
            <th>№ Поставки</th>
            <th>Дата поставки</th>
            <!-- <th class="actions-column">Действия</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="material in filteredMaterials" :key="material.material_id">
            <td>{{ material.material_name }}</td>
            <td>{{ material.type }}</td>
            <td>{{ material.unit }}</td>
            <td>{{ material.quantity }}</td>
            <td>{{ material.cost_per_unit }} ₽</td>
            <td>{{ material.delivery_number }}</td>
            <td>{{ formatDate(material.delivery_date) }}</td>
            <td class="actions-column">
              <!-- <button @click="openEditModal(material)" class="edit-button">
                Редактировать
              </button>
              <button
                @click="deleteMaterial(material.material_id)"
                class="delete-button"
              >
                Удалить
              </button> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
const searchQuery = ref("");

const showAddModal = ref(false);
const selectedMaterial = ref(null);

const materials = computed(() => store.state.materials.materials);
const error = computed(() => store.state.materials.error);

const filteredMaterials = computed(() => {
  if (!searchQuery.value) return materials.value;

  const query = searchQuery.value.toLowerCase();
  return materials.value.filter(
    (material) =>
      material.material_name.toLowerCase().includes(query) ||
      material.type.toLowerCase().includes(query) ||
      (material.delivery_number &&
        material.delivery_number.toLowerCase().includes(query)) ||
      (material.supplier_name &&
        material.supplier_name.toLowerCase().includes(query))
  );
});

const formatDate = (dateString) => {
  if (!dateString) return "—"; // Возвращаем прочерк, если дата отсутствует

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("ru-RU");
  } catch {
    return "—";
  }
};
onMounted(async () => {
  try {
    await store.dispatch("materials/fetchMaterials");
  } catch (err) {
    console.error("Ошибка загрузки материалов:", err);
  }
});

// const openEditModal = (material) => {
//   selectedMaterial.value = { ...material };
// };

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
      // После добавления нового материала обновляем список
      await store.dispatch("materials/fetchMaterials");
    }
    closeModal();
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    store.commit("materials/SET_ERROR", error.message);
  }
};

// const deleteMaterial = async (id) => {
//   if (!confirm("Вы уверены, что хотите удалить материал?")) return;

//   try {
//     await store.dispatch("materials/deleteMaterial", id);
//     // Обновляем список после удаления
//     await store.dispatch("materials/fetchMaterials");
//   } catch (error) {
//     console.error("Ошибка удаления:", error.response?.data || error.message);
//     store.commit(
//       "materials/SET_ERROR",
//       error.response?.data?.message || "Ошибка при удалении материала"
//     );
//   }
// };
</script>

<style scoped>
.materials-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.materials-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.materials-table th,
.materials-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.materials-table th {
  background-color: var(--dark-teal);
  color: white;
  position: sticky;
  top: 0;
  font-weight: 500;
}

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.materials-table tr:hover {
  background-color: rgba(139, 170, 173, 0.05);
}

.edit-button {
  background-color: var(--teal);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background-color: #7a9b9e;
}

.delete-button {
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #c82333;
  opacity: 0.95;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
}

@media (max-width: 768px) {
  .materials-table {
    display: block;
    width: 100%;
  }

  .materials-table thead {
    display: none;
  }

  .materials-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .materials-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: none;
  }

  .materials-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: var(--dark-teal);
  }

  .actions-column {
    justify-content: flex-end;
  }
}
</style>
