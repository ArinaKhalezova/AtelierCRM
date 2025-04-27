<template>
  <div class="section">
    <div class="section-header">
      <h3>Материалы</h3>
      <button
        v-if="canEdit"
        @click="showAddForm = !showAddForm"
        class="btn primary"
      >
        {{ showAddForm ? "Отмена" : "Добавить материал" }}
      </button>
    </div>

    <!-- Форма добавления -->
    <div v-if="showAddForm && canEdit" class="add-form">
      <select v-model="selectedMaterial" class="input">
        <option value="" disabled>Выберите материал</option>
        <option
          v-for="material in availableMaterials"
          :key="material.material_id"
          :value="material"
          :disabled="material.quantity <= 0"
        >
          {{ material.material_name }} (Доступно: {{ material.quantity }}
          {{ material.unit }})
        </option>
      </select>

      <input
        type="number"
        v-model.number="materialQuantity"
        min="1"
        :max="selectedMaterial?.quantity || 0"
        class="input"
        placeholder="Количество"
      />

      <button
        @click="addMaterial"
        class="btn primary"
        :disabled="!selectedMaterial || materialQuantity <= 0"
      >
        Добавить
      </button>
    </div>
    <div v-if="materials.length > 0" class="items">
      <div
        v-for="material in materials"
        :key="material.order_material_id"
        class="item"
      >
        <div class="info">
          <span class="name">{{ material.material_name }}</span>
          <span class="quantity">
            {{ material.quantity }} {{ material.unit }} ×
            {{ material.cost_per_unit }} ₽
          </span>
          <span class="total">
            {{ (material.quantity * material.cost_per_unit).toFixed(2) }} ₽
          </span>
        </div>
        <button
          v-if="canEdit"
          @click="removeMaterial(material.order_material_id)"
          class="btn danger"
        >
          Удалить
        </button>
      </div>
    </div>
    <div v-else class="empty">Нет материалов</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
  materials: {
    type: Array,
    required: true,
    default: () => [],
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();
const showAddForm = ref(false);
const selectedMaterial = ref(null);
const materialQuantity = ref(1);

const availableMaterials = computed(() => store.state.materials.materials);

const emit = defineEmits(["remove-material"]);

const removeMaterial = (materialId) => {
  emit("remove-material", materialId);
};
const addMaterial = async () => {
  try {
    await store.dispatch("orderDetails/addMaterialToOrder", {
      orderId: props.orderId,
      material: {
        material_id: selectedMaterial.value.material_id,
        quantity: materialQuantity.value,
      },
    });

    await store.dispatch("orderDetails/updateOrderTotal", props.orderId);
    // Сброс формы
    selectedMaterial.value = null;
    materialQuantity.value = 1;
    showAddForm.value = false;
  } catch (error) {
    console.error("Ошибка добавления материала:", error);
  }
};

// Загружаем материалы при монтировании
onMounted(async () => {
  await store.dispatch("materials/fetchMaterials");
});
</script>

<style scoped>
.section {
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

.add-form {
  display: grid;
  grid-template-columns: 1fr 120px 100px;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: var(--border-radius);
}

.input {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius);
  width: 100%;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.2rem;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(244, 255, 248, 0.5);
  border-radius: var(--border-radius);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-weight: 500;
  color: var(--dark-teal);
}

.quantity {
  font-size: 0.9rem;
  color: var(--warm-gray);
}

.total {
  font-weight: 500;
  color: var(--dark-teal);
}

.btn.primary {
  background-color: var(--info);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-info);
}

.btn.danger {
  background-color: white;
  border: 1px solid var(--danger);
  color: var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--warm-gray);
  font-size: 1rem;
}
</style>
