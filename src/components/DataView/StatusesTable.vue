<template>
  <DataTable
    title="Статусы"
    :headers="['status_id', 'status']"
    :rows="statuses"
    keyField="status_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  statuses: Array,
});
</script>