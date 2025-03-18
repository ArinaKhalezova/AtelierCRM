<template>
  <DataTable
    title="Клиенты"
    :headers="['client_id', 'fullname', 'phone_number', 'email', 'registration_date']"
    :rows="clients"
    keyField="client_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const clients = computed(() => store.state.clients);
</script>