<template>
  <div class="new-supply">
    <h2>Добавить новую поставку</h2>
    <form @submit.prevent="addSupply">
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
          <input v-model="material.name" placeholder="Наименование" required />
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      newSupply: {
        supplyNumber: "",
        supplierId: null,
        materials: [{ name: "", quantity: null, pricePerUnit: null, unitType: "шт" }],
        invoice: null,
      },
    };
  },
  computed: {
    ...mapGetters(["allSuppliers"]),
    suppliers() {
      return this.allSuppliers;
    },
  },
  methods: {
    ...mapActions(["addSupplyAction"]),
    addMaterial() {
      this.newSupply.materials.push({
        name: "",
        quantity: 0,
        pricePerUnit: 0,
        unitType: "шт", // По умолчанию "шт"
      });
    },
    removeMaterial(index) {
      this.newSupply.materials.splice(index, 1);
    },
    handleInvoiceUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.newSupply.invoice = reader.result; // Сохраняем файл как Data URL
        };
        reader.readAsDataURL(file);
      }
    },
    addSupply() {
      this.addSupplyAction(this.newSupply);
      this.$router.push("/supplies");
    },
  },
};
</script>

<style scoped>
.new-supply {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

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