<template>
  <DataTable
    title="Должности"
    :headers="['job_position_id', 'position_name']"
    :rows="jobPositions"
    keyField="job_position_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  jobPositions: Array,
});
</script>