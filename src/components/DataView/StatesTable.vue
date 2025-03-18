<template>
  <DataTable
    title="Статусы станков"
    :headers="['machine_state_id', 'state_name']"
    :rows="states"
    keyField="machine_state_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  states: Array,
});
</script>