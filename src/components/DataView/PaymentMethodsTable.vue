<template>
  <DataTable
    title="Методы оплаты"
    :headers="['payment_method_id', 'method_name']"
    :rows="paymentMethods"
    keyField="payment_method_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const paymentMethods = computed(() => store.state.paymentMethods.paymentMethods);
</script>