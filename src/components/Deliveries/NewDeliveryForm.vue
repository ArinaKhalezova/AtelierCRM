<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Накладная:</label>
      <select v-model="newDelivery.invoice_id" required>
        <option
          v-for="invoice in invoices"
          :key="invoice.invoice_id"
          :value="invoice.invoice_id"
        >
          {{ invoice.invoice_number }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>Материал:</label>
      <select v-model="newDelivery.material_id" required>
        <option
          v-for="material in materials"
          :key="material.material_id"
          :value="material.material_id"
        >
          {{ material.type_name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>Количество:</label>
      <input v-model="newDelivery.quantity" type="number" required />
    </div>
    <div class="form-group">
      <label>Стоимость:</label>
      <input v-model="newDelivery.cost" type="number" required />
    </div>
    <button type="submit">Добавить поставку</button>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newDelivery = ref({
  invoice_id: null,
  material_id: null,
  quantity: 0,
  cost: 0,
});

const invoices = computed(() => store.state.invoices.invoices);
const materials = computed(() => store.state.materials.materials);

const emit = defineEmits(["submit"]);

const handleSubmit = async () => {
  try {
    await store.dispatch("deliveries/addDeliveryAction", newDelivery.value);
    newDelivery.value = {
      invoice_id: null,
      material_id: null,
      quantity: 0,
      cost: 0,
    };
    emit("submit"); // Закрываем модальное окно
  } catch (err) {
    console.error("Ошибка при добавлении поставки:", err);
  }
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("invoices/fetchInvoices");
  await store.dispatch("materials/fetchMaterials");
});
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.material-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.material-row input,
.material-row select {
  flex: 1;
}

.remove-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0 0.8rem;
}

.add-material-button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

button[type="submit"] {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style>
