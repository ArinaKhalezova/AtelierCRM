<template>
  <div class="supply-details">
    <button @click="goBack" class="back-button">← Назад</button>
    <div v-if="supply">
      <h2>Детали поставки #{{ supply.supplyNumber }}</h2>

      <div class="supply-info">
        <p>
          <strong>Поставщик:</strong> {{ getSupplierName(supply.supplierId) }}
        </p>
        <p><strong>Номер поставки:</strong> {{ supply.supplyNumber }}</p>
        <p><strong>Материалы:</strong></p>
        <ul>
          <li v-for="(material, index) in supply.materials" :key="index">
            {{ material.name }} - {{ material.quantity }}
            {{ material.unitType }} ({{ material.pricePerUnit }} руб./ед.)
          </li>
        </ul>
        <p><strong>Накладная:</strong></p>
        <div v-if="supply.invoice" class="buttons">
          <button @click="openInvoice" class="view-button">
            Просмотреть накладную
          </button>
          <a :href="supply.invoice" download class="download-button"
            >Скачать накладную</a
          >
        </div>
        <p v-else>Накладная не загружена</p>
      </div>

      <div class="action-buttons">
        <button @click="startEditing" class="edit-button">Редактировать</button>
        <button @click="deleteSupply" class="delete-button">
          Удалить поставку
        </button>
      </div>

      <form v-if="isEditing" @submit.prevent="saveChanges">
        <div class="form-group">
          <label>Номер поставки:</label>
          <input v-model="editedSupply.supplyNumber" required />
        </div>

        <div class="form-group">
          <label>Поставщик:</label>
          <select v-model="editedSupply.supplierId" required>
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
            v-for="(material, index) in editedSupply.materials"
            :key="index"
            class="material-row"
          >
            <input
              v-model="material.name"
              placeholder="Наименование"
              required
            />
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
          <button
            type="button"
            @click="addMaterial"
            class="add-material-button"
          >
            + Добавить материал
          </button>
        </div>

        <div class="form-group">
          <label>Накладная:</label>
          <input type="file" @change="handleInvoiceUpload" />
        </div>

        <div class="action-buttons">
          <button type="submit" class="save-button">Сохранить</button>
          <button type="button" @click="cancelEditing" class="cancel-button">
            Отмена
          </button>
        </div>
      </form>
    </div>
    <div v-else>
      <p>Поставка не найдена</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      isEditing: false,
      editedSupply: null,
    };
  },
  computed: {
    ...mapGetters(["getSupplyById", "allSuppliers"]),
    supply() {
      return this.getSupplyById(this.$route.params.id);
    },
    suppliers() {
      return this.allSuppliers;
    },
  },
  methods: {
    ...mapActions(["updateSupplyAction", "deleteSupplyAction"]),

    getSupplierName(supplierId) {
      const supplier = this.suppliers.find((s) => s.id === supplierId);
      return supplier ? supplier.name : "Неизвестный поставщик";
    },

    openInvoice() {
      if (this.supply.invoice) {
        window.open(this.supply.invoice, "_blank");
      }
    },

    startEditing() {
      this.editedSupply = { ...this.supply };
      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
      this.editedSupply = null;
    },

    saveChanges() {
      this.updateSupplyAction(this.editedSupply);
      this.isEditing = false;
    },

    deleteSupply() {
      if (confirm("Вы уверены, что хотите удалить эту поставку?")) {
        this.deleteSupplyAction(this.supply.id);
        this.$router.push("/supplies");
      }
    },

    addMaterial() {
      this.editedSupply.materials.push({
        name: "",
        quantity: 0,
        pricePerUnit: 0,
        unitType: "шт",
      });
    },

    removeMaterial(index) {
      this.editedSupply.materials.splice(index, 1);
    },

    handleInvoiceUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.editedSupply.invoice = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },

    goBack() {
      this.$router.push("/supplies");
    },
  },
};
</script>

<style scoped>
.supply-details {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.back-button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.supply-info {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.action-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.edit-button {
  background-color: #4caf50;
  color: white;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.save-button {
  background-color: #2196f3;
  color: white;
}

.cancel-button {
  background-color: #9e9e9e;
  color: white;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.download-button {
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}
.download-button:hover {
  opacity: 0.9;
}

button:hover {
  opacity: 0.9;
}

.form-group {
  margin-bottom: 1rem;
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
</style>
