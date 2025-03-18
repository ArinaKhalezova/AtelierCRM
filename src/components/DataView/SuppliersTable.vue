<template>
  <DataTable
    title="Поставщики"
    :headers="['supplier_id', 'org_name', 'phone_number', 'address', 'inn']"
    :rows="suppliers"
    keyField="supplier_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const suppliers = computed(() => store.state.suppliers.suppliers);
</script>