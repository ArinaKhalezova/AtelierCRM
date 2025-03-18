<template>
  <DataTable
    title="Накладные"
    :headers="['invoice_id', 'supplier_name', 'delivery_date', 'party']"
    :rows="invoices"
    keyField="invoice_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const invoices = computed(() => store.state.invoices.invoices);
</script>
