<template>
  <DataTable
    title="Статусы станков"
    :headers="['machine_state_id', 'state_name']"
    :rows="states"
    keyField="machine_state_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const states = computed(() => store.state.machineStates.machineStates);
</script>