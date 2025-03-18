<template>
  <DataTable
    title="Типы материала"
    :headers="['material_type_id', 'type_name']"
    :rows="materialTypes"
    keyField="material_type_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const materialTypes = computed(() => store.state.materialTypes.materialTypes);
</script>