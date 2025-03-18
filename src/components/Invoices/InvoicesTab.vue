<template>
  <div class="invoices-tab">
    <h2>Накладные</h2>
    <button @click="openInvoiceModal" class="add-invoice-button">
      Добавить накладную
    </button>

    <div class="invoice-list">
      <div v-for="invoice in invoices" :key="invoice.invoice_id" class="invoice-item">
        <div class="invoice-header">
          <div class="invoice-info">
            <p><strong>Номер накладной:</strong> {{ invoice.invoice_number }}</p>
            <p>
              <strong>Поставщик:</strong>
              {{ invoice.supplier_name }}
            </p>
            <p><strong>Дата поставки:</strong> {{ invoice.delivery_date }}</p>
            <p><strong>Партия:</strong> {{ invoice.party }}</p>
          </div>
          <div class="invoice-actions">
            <button @click="deleteInvoice(invoice.invoice_id)" class="delete-button">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления накладной -->
    <Modal :isOpen="isInvoiceModalOpen" @close="closeInvoiceModal">
      <h3>Добавить новую накладную</h3>
      <NewInvoiceForm @submit="closeInvoiceModal" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";
import NewInvoiceForm from "./NewInvoiceForm.vue";

const store = useStore();

const isInvoiceModalOpen = ref(false);

const invoices = computed(() => store.state.invoices.invoices);

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await store.dispatch("invoices/fetchInvoices");
});

const openInvoiceModal = () => {
  isInvoiceModalOpen.value = true;
};

const closeInvoiceModal = () => {
  isInvoiceModalOpen.value = false;
};

const deleteInvoice = async (invoiceId) => {
  if (confirm("Вы уверены, что хотите удалить эту накладную?")) {
    try {
      await store.dispatch("invoices/deleteInvoiceAction", invoiceId);
    } catch (err) {
      console.error("Ошибка при удалении накладной:", err);
    }
  }
};
</script>