<template>
  <div class="edit-delivery-form">
    <h3>Редактирование поставки №{{ delivery.delivery_number }}</h3>

    <!-- Общая ошибка формы -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <form @submit.prevent="handleSubmit">
      <div
        class="form-group"
        :class="{ 'has-error': formErrors.delivery_number }"
      >
        <label>Номер поставки</label>
        <input v-model="formData.delivery_number" required />
        <span v-if="formErrors.delivery_number" class="field-error">
          {{ formErrors.delivery_number }}
        </span>
      </div>

      <div
        class="form-group"
        :class="{ 'has-error': formErrors.delivery_date }"
      >
        <label>Дата поставки</label>
        <input v-model="formData.delivery_date" type="date" required />
        <span v-if="formErrors.delivery_date" class="field-error">
          {{ formErrors.delivery_date }}
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': formErrors.supplier_id }">
        <label>Поставщик</label>
        <select v-model="formData.supplier_id" required>
          <option
            v-for="supplier in suppliers"
            :key="supplier.supplier_id"
            :value="supplier.supplier_id"
          >
            {{ supplier.org_name }}
          </option>
        </select>
        <span v-if="formErrors.supplier_id" class="field-error">
          {{ formErrors.supplier_id }}
        </span>
      </div>

      <!-- Список материалов -->
      <div class="materials-section">
        <h4>Материалы</h4>
        <div
          v-for="(material, index) in formData.materials"
          :key="index"
          class="material-item"
        >
          <div
            class="form-group"
            :class="{
              'has-error': formErrors[`materials.${index}.material_name`],
            }"
          >
            <input
              v-model="material.material_name"
              placeholder="Название"
              required
            />
            <span
              v-if="formErrors[`materials.${index}.material_name`]"
              class="field-error"
            >
              {{ formErrors[`materials.${index}.material_name`] }}
            </span>
          </div>

          <div
            class="form-group"
            :class="{ 'has-error': formErrors[`materials.${index}.quantity`] }"
          >
            <input
              v-model="material.quantity"
              type="number"
              min="1"
              placeholder="Количество"
              required
            />
            <span
              v-if="formErrors[`materials.${index}.quantity`]"
              class="field-error"
            >
              {{ formErrors[`materials.${index}.quantity`] }}
            </span>
          </div>

          <div
            class="form-group"
            :class="{
              'has-error': formErrors[`materials.${index}.cost_per_unit`],
            }"
          >
            <input
              v-model="material.cost_per_unit"
              type="number"
              min="0"
              step="0.01"
              placeholder="Цена за единицу"
              required
            />
            <span
              v-if="formErrors[`materials.${index}.cost_per_unit`]"
              class="field-error"
            >
              {{ formErrors[`materials.${index}.cost_per_unit`] }}
            </span>
          </div>

          <button
            @click="removeMaterial(index)"
            type="button"
            class="delete-button"
          >
            Удалить
          </button>
        </div>
        <button @click="addMaterial" type="button" class="add-material-button">
          + Добавить материал
        </button>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="cancel-button">
          Отмена
        </button>
        <button type="submit" :disabled="isSubmitting" class="submit-button">
          {{ isSubmitting ? "Сохранение..." : "Сохранить" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  delivery: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const store = useStore();
const formData = ref({ ...props.delivery });
const suppliers = ref([]);
const error = ref("");
const isSubmitting = ref(false);
const formErrors = ref({});

// Загрузка поставщиков
onMounted(async () => {
  try {
    await store.dispatch("suppliers/fetchSuppliers");
    suppliers.value = store.state.suppliers.suppliers;
  } catch (err) {
    error.value = "Ошибка загрузки поставщиков";
  }
});

const addMaterial = () => {
  formData.value.materials.push({
    material_id: null,
    material_name: "",
    quantity: 1,
    cost_per_unit: 0,
    type: "Другое",
    unit: "Штука",
  });
};

const removeMaterial = (index) => {
  formData.value.materials.splice(index, 1);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  error.value = "";
  formErrors.value = {};

  try {
    await store.dispatch("deliveries/updateDeliveryAction", {
      id: props.delivery.delivery_id,
      deliveryData: formData.value,
    });
    emit("submit");
  } catch (err) {
    error.value =
      err.response?.data?.message || "Ошибка при обновлении поставки";
    if (err.response?.data?.errors) {
      formErrors.value = err.response.data.errors;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.edit-delivery-form {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.edit-delivery-form h3 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  text-align: center;
}

.error-message {
  color: #d32f2f;
  background-color: #fde8e8;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.form-error {
  color: #d32f2f;
  margin-bottom: 16px;
  font-size: 0.9em;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.has-error input,
.form-group.has-error select {
  border-color: #d32f2f;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8em;
  display: block;
  margin-top: 4px;
}

.hint {
  color: #666;
  font-size: 0.8em;
  margin-top: 4px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-teal);
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.materials-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid var(--warm-gray);
  border-radius: var(--border-radius);
}

.materials-section h4 {
  color: var(--dark-teal);
  margin-bottom: 1rem;
}

.material-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--warm-gray);
}

.add-material-button {
  background-color: var(--teal);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-material-button:hover {
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
  height: fit-content;
}

.delete-button:hover {
  background-color: #c82333;
  opacity: 0.95;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  background-color: var(--warm-gray);
  color: var(--dark-gray);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #d1d1d1;
}

.submit-button {
  background-color: var(--dark-teal);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background-color: #244a4b;
  opacity: 0.95;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .material-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .delete-button {
    width: 100%;
    margin-top: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
