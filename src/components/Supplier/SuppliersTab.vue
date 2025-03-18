<template>
  <div class="suppliers-tab">
    <h2>Поставщики</h2>
    <button @click="openSupplierModal" class="add-supplier-button">
      Добавить поставщика
    </button>

    <div class="supplier-list">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div
        v-for="supplier in suppliers"
        :key="supplier.supplier_id"
        class="supplier-item"
      >
        <p><strong>Название:</strong> {{ supplier.org_name }}</p>
        <p><strong>Телефон:</strong> {{ supplier.phone_number }}</p>
        <p><strong>Адрес:</strong> {{ supplier.address }}</p>
        <p><strong>ИНН:</strong> {{ supplier.inn }}</p>
        <button @click="deleteSupplier(supplier.supplier_id)" class="delete-button">
          Удалить
        </button>
      </div>
    </div>

    <!-- Модальное окно для добавления поставщика -->
    <Modal :isOpen="isSupplierModalOpen" @close="closeSupplierModal">
      <h3>Добавить нового поставщика</h3>
      <form @submit.prevent="addSupplier">
        <div class="form-group">
          <label>Название организации:</label>
          <input v-model="newSupplier.org_name" required />
        </div>
        <div class="form-group">
          <label>Телефон:</label>
          <input v-model="newSupplier.phone_number" required />
        </div>
        <div class="form-group">
          <label>Адрес:</label>
          <input v-model="newSupplier.address" required />
        </div>
        <div class="form-group">
          <label>ИНН:</label>
          <input v-model="newSupplier.inn" required />
        </div>
        <button type="submit">Добавить поставщика</button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "./Modal.vue";

const store = useStore();

const isSupplierModalOpen = ref(false);

const openSupplierModal = () => {
  isSupplierModalOpen.value = true;
};

const closeSupplierModal = () => {
  isSupplierModalOpen.value = false;
};

const newSupplier = ref({
  org_name: "",
  phone_number: "",
  address: "",
  inn: "",
});
const error = computed(() => store.state.suppliers.error);

const suppliers = computed(() => store.state.suppliers.suppliers);

const addSupplier = async () => {
  if (
    newSupplier.value.org_name.trim() &&
    newSupplier.value.phone_number.trim() &&
    newSupplier.value.address.trim() &&
    newSupplier.value.inn.trim()
  ) {
    try {
      await store.dispatch("suppliers/addSupplierAction", {
        org_name: newSupplier.value.org_name,
        phone_number: newSupplier.value.phone_number,
        address: newSupplier.value.address,
        inn: newSupplier.value.inn,
      });
      newSupplier.value = { org_name: "", phone_number: "", address: "", inn: "" }; // Сброс формы
      error.value = ""; // Очистка ошибки
      closeSupplierModal(); // Закрытие модального окна
    } catch (err) {
      error.value = "Ошибка при добавлении поставщика";
    }
  } else {
    error.value = "Все поля обязательны для заполнения";
  }
};

const deleteSupplier = async (id) => {
  if (confirm("Вы уверены, что хотите удалить эту должность?")) {
    try {
      await store.dispatch("suppliers/deleteSupplierAction", id);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении должности";
    }
  }
};

onMounted(async () => {
  try {
    await store.dispatch("suppliers/fetchSuppliers");
  } catch (err) {
    error.value = "Ошибка при загрузке поставщиков";
  }
});
</script>

<style scoped>
.add-supplier-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-supplier-button:hover {
  background-color: #3aa876;
}
</style>
