<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Номер поставки:</label>
      <input v-model="newSupply.supplyNumber" required />
    </div>
    <div class="form-group">
      <label>Поставщик:</label>
      <select v-model="newSupply.supplierId" required>
        <option
          v-for="supplier in suppliers"
          :key="supplier.id"
          :value="supplier.id"
        >
          {{ supplier.name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>Материалы:</label>
      <div
        v-for="(material, index) in newSupply.materials"
        :key="index"
        class="material-row"
      >
        <select v-model="material.material_type_id" required>
          <option
            v-for="materialType in materialTypes"
            :key="materialType.material_type_id"
            :value="materialType.material_type_id"
          >
            {{ materialType.type_name }}
          </option>
        </select>
        <input
          v-model="material.quantity"
          type="number"
          placeholder="Количество"
          required
        />
        <input
          v-model="material.pricePerUnit"
          type="number"
          placeholder="Цена за единицу"
          required
        />
        <select v-model="material.unitType" required>
          <option value="шт">Штуки</option>
          <option value="метры">Метры</option>
          <option value="упаковка">Упаковка</option>
        </select>
        <button
          type="button"
          @click="removeMaterial(index)"
          class="remove-button"
        >
          ×
        </button>
      </div>
      <button type="button" @click="addMaterial" class="add-material-button">
        + Добавить материал
      </button>
    </div>
    <div class="form-group">
      <label>Накладная:</label>
      <input
        type="file"
        @change="handleInvoiceUpload"
        accept=".pdf, .jpg, .jpeg, .png"
      />
    </div>
    <button type="submit">Добавить поставку</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newSupply = ref({
  supplyNumber: "",
  supplierId: null,
  materials: [
    {
      material_type_id: null,
      quantity: 0,
      pricePerUnit: 0,
      unitType: "шт",
    },
  ],
  invoice: null,
});

const emit = defineEmits(["submit"]);

const handleSubmit = () => {
  store.dispatch("addSupplyAction", newSupply.value);
  newSupply.value = {
    supplyNumber: "",
    supplierId: null,
    materials: [
      {
        material_type_id: null,
        quantity: 0,
        pricePerUnit: 0,
        unitType: "шт",
      },
    ],
    invoice: null,
  };
  emit("submit"); // Закрываем модальное окно
};
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
