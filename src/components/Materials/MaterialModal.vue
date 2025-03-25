<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ material ? "Редактировать материал" : "Добавить материал" }}</h2>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="material_name">Название материала:</label>
          <input
            id="material_name"
            v-model="formData.material_name"
            type="text"
            required
          />
        </div>

        <div class="form-group">
          <label for="type">Тип материала:</label>
          <select id="type" v-model="formData.type" required>
            <option v-for="type in materialTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="unit">Единица измерения:</label>
          <select id="unit" v-model="formData.unit" required>
            <option v-for="unit in materialUnits" :key="unit" :value="unit">
              {{ unit }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="quantity">Количество:</label>
          <input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="form-group">
          <label for="cost_per_unit">Цена за единицу (₽):</label>
          <input
            id="cost_per_unit"
            v-model.number="formData.cost_per_unit"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="close" class="cancel-button">
            Отмена
          </button>
          <button type="submit" class="submit-button">
            {{ material ? "Сохранить" : "Добавить" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  material: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

const store = useStore();

const formData = ref({
  material_name: "",
  type: "",
  unit: "",
  quantity: 0,
  cost_per_unit: 0,
});

onMounted(() => {
  // Загружаем типы и единицы измерения, если они еще не загружены
  if (materialTypes.value.length === 0) {
    store.dispatch("materials/fetchMaterialTypes");
  }
  if (materialUnits.value.length === 0) {
    store.dispatch("materials/fetchMaterialUnits");
  }

  // Если передан материал для редактирования, заполняем форму
  if (props.material) {
    formData.value = { ...props.material };
  }
});

const materialTypes = computed(() => store.getters["materials/materialTypes"]);
const materialUnits = computed(() => store.getters["materials/materialUnits"]);

const close = () => {
  emit("close");
};
const submitForm = () => {
  // Преобразуем числовые поля перед отправкой
  const dataToSend = {
    ...formData.value,
    quantity: Number(formData.value.quantity),
    cost_per_unit: Number(formData.value.cost_per_unit),
  };
  emit("save", dataToSend);
  close();
};
</script>

<style scoped>
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

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background: #3aa876;
}
</style>
