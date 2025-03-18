<template>
  <DataTable
    title="Методы оплаты"
    :headers="['payment_method_id', 'method_name']"
    :rows="paymentMethods"
    keyField="payment_method_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  paymentMethods: Array,
});
</script>
