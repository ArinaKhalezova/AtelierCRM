<template>
  <DataTable
    title="Должности"
    :headers="['job_position_id', 'position_name']"
    :rows="jobPositions"
    keyField="job_position_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const jobPositions = computed(() => store.state.jobPositions.jobPositions);
</script>