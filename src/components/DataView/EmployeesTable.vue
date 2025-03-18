<template>
  <DataTable
    title="Сотрудники"
    :headers="['employee_id', 'position_name', 'fullname', 'phone_number', 'email']"
    :rows="employees"
    keyField="employee_id"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import DataTable from "./DataTable.vue";

// Получаем доступ к хранилищу Vuex
const store = useStore();

// Получаем данные клиентов из Vuex
const employees = computed(() => store.state.employees.employees);
</script>