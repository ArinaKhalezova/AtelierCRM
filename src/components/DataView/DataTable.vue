<template>
  <div class="data-table">
    <div class="table-header" @click="toggleVisibility">
      <h2>{{ title }}</h2>
      <span class="toggle-icon">{{ isVisible ? "▼" : "▶" }}</span>
    </div>
    <table v-if="isVisible">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row[keyField]">
          <!-- Используем header.toLowerCase() для сопоставления с ключами данных -->
          <td v-for="header in headers" :key="header">
            {{ row[header.toLowerCase()] || row[header] || "N/A" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  title: String,
  headers: Array,
  rows: Array,
  keyField: String,
});

const isVisible = ref(false);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};
</script>

<style scoped>
.data-table {
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

h2 {
  margin-bottom: 1rem;
  color: var(--primary-color);
  margin-right: 0.5rem;
}

.toggle-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: var(--primary-color);
  color: white;
}

tr:hover {
  background-color: #f5f5f5;
}
</style>