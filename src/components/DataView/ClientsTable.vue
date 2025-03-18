<template>
  <DataTable
    title="Клиенты"
    :headers="['client_id', 'fullname', 'phone_number', 'email', 'registration_date']"
    :rows="clients"
    keyField="client_id"
  />
</template>

<script setup>
import DataTable from "./DataTable.vue";

defineProps({
  clients: Array,
});
</script>