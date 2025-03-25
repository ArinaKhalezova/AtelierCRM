<template>
  <form @submit.prevent="handleSubmit" class="delivery-form">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="form-section">
      <h3>Основные данные</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Поставщик</label>
          <select v-model="formData.supplier_id" required>
            <option value="" disabled>Выберите поставщика</option>
            <option
              v-for="supplier in suppliers"
              :key="supplier.supplier_id"
              :value="supplier.supplier_id"
            >
              {{ supplier.org_name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Дата поставки</label>
          <input v-model="formData.delivery_date" type="date" required />
        </div>
      </div>

      <div class="form-group">
        <label>Путь к документу</label>
        <input
          v-model="formData.document_path"
          type="text"
          placeholder="/documents/delivery_123.pdf"
        />
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3>Материалы в поставке</h3>
        <button type="button" @click="openMaterialModal" class="add-button">
          <span class="plus-icon">+</span> Добавить материал
        </button>
      </div>

      <div v-if="formData.materials.length > 0" class="materials-table">
        <div class="table-header">
          <div>Название</div>
          <div>Тип</div>
          <div>Кол-во</div>
          <div>Цена</div>
          <div class="actions-column"></div>
        </div>
        <div
          v-for="(material, index) in formData.materials"
          :key="index"
          class="table-row"
        >
          <div>
            {{
              material.material_name || getMaterialName(material.material_id)
            }}
          </div>
          <div>{{ material.type }}</div>
          <div>{{ material.quantity }} {{ material.unit }}</div>
          <div>{{ material.cost_per_unit }} ₽</div>
          <div class="actions-column">
            <button
              @click="removeMaterial(index)"
              type="button"
              class="delete-button"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Нет добавленных материалов</p>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="cancel" class="cancel-button">
        Отмена
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !canSubmit"
        class="submit-button"
      >
        {{ isSubmitting ? "Сохранение..." : "Создать поставку" }}
      </button>
    </div>

    <Modal :isOpen="showMaterialModal" @close="closeMaterialModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Добавить материал</h3>
        </div>
        <div class="modal-scrollable-content">
          <div class="modal-form-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Название</label>
                <input
                  v-model="newMaterial.material_name"
                  type="text"
                  required
                />
              </div>
              <div class="form-group">
                <label>Тип</label>
                <select v-model="newMaterial.type" required>
                  <option value="" disabled>Выберите тип</option>
                  <option
                    v-for="type in materialTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Ед. измерения</label>
                <select v-model="newMaterial.unit" required>
                  <option value="" disabled>Выберите единицу</option>
                  <option
                    v-for="unit in materialUnits"
                    :key="unit"
                    :value="unit"
                  >
                    {{ unit }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Количество</label>
                <input
                  v-model.number="newMaterial.quantity"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div class="form-group">
                <label>Цена за ед. (₽)</label>
                <input
                  v-model.number="newMaterial.cost_per_unit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            @click="closeMaterialModal"
            class="cancel-button"
          >
            Отмена
          </button>
          <button
            type="button"
            @click="confirmAddMaterial"
            class="submit-button"
          >
            Добавить
          </button>
        </div>
      </div>
    </Modal>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/Modal.vue";

const store = useStore();
const emit = defineEmits(["submit", "cancel"]);

// Состояние формы
const isSubmitting = ref(false);
const showMaterialModal = ref(false);
const errorMessage = ref("");

const newMaterial = ref({
  material_name: "",
  type: "",
  unit: "",
  quantity: 1,
  cost_per_unit: 0,
});

const formData = ref({
  supplier_id: "",
  delivery_date: new Date().toISOString().split("T")[0],
  document_path: "",
  materials: [],
});

// Получение данных
const suppliers = computed(() => store.state.suppliers?.suppliers || []);
const materialTypes = computed(
  () => store.getters["materials/materialTypes"] || []
);
const materialUnits = computed(
  () => store.getters["materials/materialUnits"] || []
);

// Загрузка данных
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("suppliers/fetchSuppliers"),
      store.dispatch("materials/fetchMaterialTypes"),
      store.dispatch("materials/fetchMaterialUnits"),
    ]);

    // Установка первых значений по умолчанию
    if (materialTypes.value.length > 0) {
      newMaterial.value.type = materialTypes.value[0];
    }
    if (materialUnits.value.length > 0) {
      newMaterial.value.unit = materialUnits.value[0];
    }
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
    errorMessage.value = "Не удалось загрузить необходимые данные";
  }
});

// Валидация формы
const canSubmit = computed(() => {
  return (
    formData.value.supplier_id &&
    formData.value.delivery_date &&
    formData.value.materials.length > 0
  );
});

// Работа с модальным окном
const openMaterialModal = () => {
  showMaterialModal.value = true;
};

const closeMaterialModal = () => {
  showMaterialModal.value = false;
  errorMessage.value = "";
};

const confirmAddMaterial = () => {
  if (!newMaterial.value.material_name?.trim()) {
    errorMessage.value = "Введите название материала";
    return;
  }
  if (!newMaterial.value.type) {
    errorMessage.value = "Выберите тип материала";
    return;
  }
  if (!newMaterial.value.unit) {
    errorMessage.value = "Выберите единицу измерения";
    return;
  }
  if (!newMaterial.value.quantity || newMaterial.value.quantity <= 0) {
    errorMessage.value = "Введите корректное количество";
    return;
  }
  if (
    !newMaterial.value.cost_per_unit ||
    newMaterial.value.cost_per_unit <= 0
  ) {
    errorMessage.value = "Введите корректную цену";
    return;
  }

  formData.value.materials.push({
    material_name: newMaterial.value.material_name.trim(),
    type: newMaterial.value.type,
    unit: newMaterial.value.unit,
    quantity: Number(newMaterial.value.quantity),
    cost_per_unit: Number(newMaterial.value.cost_per_unit),
    is_new: true,
  });

  // Сброс формы
  newMaterial.value = {
    material_name: "",
    type: materialTypes.value[0] || "",
    unit: materialUnits.value[0] || "",
    quantity: 1,
    cost_per_unit: 0,
  };

  closeMaterialModal();
};

// Остальные методы
const removeMaterial = (index) => {
  formData.value.materials.splice(index, 1);
};

const getMaterialName = (id) => {
  const material = store.state.materials.materials.find(
    (m) => m.material_id === id
  );
  return material ? `${material.material_name}` : "Неизвестный материал";
};

const cancel = () => {
  emit("cancel");
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";

  const hasInvalidMaterials = formData.value.materials.some((material) => {
    return (
      !material.material_name?.trim() ||
      !material.type ||
      !material.unit ||
      !material.quantity ||
      material.quantity <= 0 ||
      !material.cost_per_unit ||
      material.cost_per_unit <= 0
    );
  });

  if (hasInvalidMaterials) {
    errorMessage.value = "Один или несколько материалов имеют неверные данные";
    isSubmitting.value = false;
    return;
  }

  try {
    const deliveryData = {
      supplier_id: formData.value.supplier_id,
      delivery_date: formData.value.delivery_date,
      document_path: formData.value.document_path || null,
      materials: formData.value.materials.map((m) => ({
        material_name: m.material_name,
        type: m.type,
        unit: m.unit,
        quantity: m.quantity,
        cost_per_unit: m.cost_per_unit,
        ...(m.material_id ? { material_id: m.material_id } : { is_new: true }),
      })),
    };

    await store.dispatch("deliveries/addDeliveryAction", deliveryData);
    emit("submit");

    // Сброс формы
    formData.value = {
      supplier_id: "",
      delivery_date: new Date().toISOString().split("T")[0],
      document_path: "",
      materials: [],
    };
  } catch (err) {
    console.error("Ошибка создания поставки:", err);
    errorMessage.value =
      err.response?.data?.message ||
      err.message ||
      "Ошибка при создании поставки";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.delivery-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.form-section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--dark-teal);
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: var(--border);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.2);
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

.materials-table {
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  border: var(--border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.table-header {
  display: contents;
}

.table-header > div {
  background-color: var(--dark-teal);
  color: white;
  padding: 1rem;
  font-weight: 500;
}

.table-row {
  display: contents;
}

.table-row > div {
  padding: 1rem;
  border-bottom: var(--border);
  display: flex;
  align-items: center;
}

.actions-column {
  justify-content: flex-end;
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

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--warm-gray);
  border: 1px dashed var(--warm-gray);
  border-radius: var(--border-radius);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button {
  background-color: var(--warm-gray);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #5e5756;
  opacity: 0.95;
}

.submit-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #244a4b;
  opacity: 0.95;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
}

/* Стили для модального окна */
.modal-container {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 600px;
  max-width: 95vw;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.modal-scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
}

.modal-form-content {
  min-height: min-content;
  padding: 1rem 0;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: var(--border);
}

.modal-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
}

.modal-form {
  padding: 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.modal-actions {
  padding: 1.5rem;
  border-top: var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .materials-table {
    grid-template-columns: 1fr;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: flex;
    flex-wrap: wrap;
    padding: 1rem;
    border-bottom: var(--border);
  }

  .table-row > div {
    flex: 1 1 50%;
    padding: 0.5rem;
    border-bottom: none;
  }

  .table-row > div::before {
    content: attr(data-label);
    font-weight: 500;
    color: var(--dark-teal);
    margin-right: 0.5rem;
  }

  .actions-column {
    justify-content: flex-start;
    flex-basis: 100%;
    margin-top: 0.5rem;
  }

  .modal-container {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-scrollable-content {
    padding: 0 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
