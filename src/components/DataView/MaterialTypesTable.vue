<template>
  <DataTable
    title="Типы материала"
    :headers="['material_type_id', 'type_name']"
    :rows="materialTypes"
    keyField="material_type_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  materialTypes: Array,
});
</script>