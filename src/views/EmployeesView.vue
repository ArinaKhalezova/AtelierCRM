<template>
  <div class="employees-view">
    <EmployeesTab />
  </div>
</template>

<script setup>
import EmployeesTab from "@/components/Employees/EmployeesTab.vue";
</script>

<style scoped>
.employees-view {
  background-color: var(--surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}
</style>