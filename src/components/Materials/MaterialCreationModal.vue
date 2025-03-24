<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>Создать новый материал</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Название материала:</label>
          <input v-model="formData.material_name" required />
        </div>

        <div class="form-group">
          <label>Тип материала:</label>
          <select v-model="formData.type" required>
            <option value="" disabled>Выберите тип</option>
            <option v-for="type in materialTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Единица измерения:</label>
          <select v-model="formData.unit" required>
            <option value="" disabled>Выберите единицу</option>
            <option v-for="unit in materialUnits" :key="unit" :value="unit">
              {{ unit }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="close">Отмена</button>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Создание..." : "Создать" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const emit = defineEmits(["close", "material-created"]);

// Инициализация формы с пустыми значениями
const formData = ref({
  material_name: "",
  type: "", // Здесь должно быть пустое значение по умолчанию
  unit: "", // Здесь должно быть пустое значение по умолчанию
  quantity: 0,
  cost_per_unit: 0,
});

const isSubmitting = ref(false);

// Получение типов и единиц из хранилища
const materialTypes = computed(() => store.getters["materials/materialTypes"]);
const materialUnits = computed(() => store.getters["materials/materialUnits"]);

const close = () => emit("close");

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    const newMaterial = await store.dispatch(
      "materials/addMaterial",
      formData.value
    );
    emit("material-created", newMaterial);
    close();
  } catch (error) {
    console.error("Ошибка создания материала:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Загрузка типов и единиц при монтировании компонента
onMounted(async () => {
  await store.dispatch("materials/fetchMaterialTypes");
  await store.dispatch("materials/fetchMaterialUnits");
});
</script>

<style scoped>
.modal-overlay {
  /* Стили модального окна */
}
</style>
