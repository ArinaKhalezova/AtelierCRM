<template>
  <form @submit.prevent="handleSubmit" class="delivery-form">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Основные поля поставки -->
    <div class="form-group">
      <label>Поставщик:</label>
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
      <label>Дата поставки:</label>
      <input v-model="formData.delivery_date" type="date" required />
    </div>

    <div class="form-group">
      <label>Путь к документу:</label>
      <input
        v-model="formData.document_path"
        type="text"
        placeholder="Например: /documents/delivery_123.pdf"
      />
    </div>

    <!-- Секция материалов -->
    <div class="materials-section">
      <div class="section-header">
        <h3>Материалы в поставке</h3>
        <button type="button" @click="openMaterialModal" class="add-btn">
          + Добавить материал
        </button>
      </div>

      <!-- Список добавленных материалов -->
      <div v-if="formData.materials.length > 0" class="materials-list">
        <div
          v-for="(material, index) in formData.materials"
          :key="index"
          class="material-item"
        >
          <div class="material-info">
            <template v-if="material.material_id">
              <strong>{{ getMaterialName(material.material_id) }}</strong>
            </template>
            <template v-else>
              <strong>Новый материал:</strong> {{ material.material_name }} ({{
                material.type
              }})
            </template>
            <div class="material-details">
              <span>Кол-во: {{ material.quantity }} {{ material.unit }}</span>
              <span>Цена: {{ material.cost_per_unit }} ₽/ед.</span>
            </div>
          </div>
          <button
            @click="removeMaterial(index)"
            type="button"
            class="remove-btn"
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>
      <div v-else class="empty-materials">
        <p>Нет добавленных материалов</p>
      </div>
    </div>

    <!-- Кнопки формы -->
    <div class="form-actions">
      <button type="button" @click="cancel" class="cancel-btn">Отмена</button>
      <button type="submit" :disabled="isSubmitting || !canSubmit">
        {{ isSubmitting ? "Сохранение..." : "Создать поставку" }}
      </button>
    </div>

    <!-- Модальное окно добавления материала -->
    <div
      v-if="showMaterialModal"
      class="modal-overlay"
      @click.self="closeMaterialModal"
    >
      <div class="modal-content">
        <h3>Добавить материал</h3>
        <div class="form-group">
          <label>Название:</label>
          <input v-model="newMaterial.material_name" type="text" />
        </div>
        <div class="form-group">
          <label>Тип:</label>
          <select v-model="newMaterial.type">
            <option value="" disabled>Выберите тип</option>
            <option v-for="type in materialTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Ед. измерения:</label>
          <select v-model="newMaterial.unit">
            <option value="" disabled>Выберите единицу</option>
            <option v-for="unit in materialUnits" :key="unit" :value="unit">
              {{ unit }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Количество:</label>
          <input
            v-model.number="newMaterial.quantity"
            type="number"
            min="1"
            required
          />
        </div>
        <div class="form-group">
          <label>Цена за ед. (₽):</label>
          <input
            v-model.number="newMaterial.cost_per_unit"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeMaterialModal" class="cancel-btn">
            Отмена
          </button>
          <button type="button" @click="confirmAddMaterial" class="confirm-btn">
            Добавить
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

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
  // Проверяем, что все поля заполнены
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

  // Добавляем материал с явным указанием всех полей
  formData.value.materials.push({
    material_name: newMaterial.value.material_name.trim(),
    type: newMaterial.value.type,
    unit: newMaterial.value.unit,
    quantity: Number(newMaterial.value.quantity),
    cost_per_unit: Number(newMaterial.value.cost_per_unit),
    is_new: true, // Явно указываем, что это новый материал
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

  // Дополнительная проверка материалов перед отправкой
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
    // Подготавливаем данные для отправки
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
        // Если material_id есть - используем его, иначе указываем, что материал новый
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.materials-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.materials-list {
  margin-top: 1rem;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.material-info {
  flex-grow: 1;
}

.material-details {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.empty-materials {
  padding: 1rem;
  text-align: center;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
}

.add-btn,
.confirm-btn {
  background: #007bff;
  color: white;
  border: none;
}

button[type="submit"] {
  background: #28a745;
  color: white;
  border: none;
}

.error-message {
  color: #dc3545;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

/* Стили модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
