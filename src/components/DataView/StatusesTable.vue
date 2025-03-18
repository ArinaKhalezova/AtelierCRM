<template>
  <DataTable
    title="Статусы"
    :headers="['status_id', 'status']"
    :rows="statuses"
    keyField="status_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const statuses = computed(() => store.state.statuses.statuses);
</script>