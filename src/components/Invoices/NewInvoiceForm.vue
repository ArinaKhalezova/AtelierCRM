<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Поставщик:</label>
      <select v-model="newInvoice.supplier_id" required>
        <option v-for="supplier in suppliers" :key="supplier.supplier_id" :value="supplier.supplier_id">
          {{ supplier.org_name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>Дата поставки:</label>
      <input v-model="newInvoice.delivery_date" type="date" required />
    </div>
    <div class="form-group">
      <label>Партия:</label>
      <input v-model="newInvoice.party" required />
    </div>
    <button type="submit">Добавить накладную</button>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newInvoice = ref({
  supplier_id: null,
  delivery_date: "",
  party: "",
});

const suppliers = computed(() => store.state.suppliers.suppliers);

const emit = defineEmits(["submit"]);

const handleSubmit = async () => {
  try {
    await store.dispatch("invoices/addInvoiceAction", newInvoice.value);
    newInvoice.value = { supplier_id: null, delivery_date: "", party: "" };
    emit("submit"); // Закрываем модальное окно
  } catch (err) {
    console.error("Ошибка при добавлении накладной:", err);
  }
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("suppliers/fetchSuppliers");
});
</script>