<template>
  <div class="section">
    <h3>Основная информация</h3>
    <table class="info-table">
      <tbody>
        <tr>
          <td class="label">Клиент:</td>
          <td class="value">{{ order.client_name }}</td>
        </tr>
        <tr>
          <td class="label">Телефон:</td>
          <td class="value">{{ order.client_phone || "—" }}</td>
        </tr>
        <tr>
          <td class="label">Дата создания:</td>
          <td class="value">{{ formatDate(order.created_at) }}</td>
        </tr>
        <tr>
          <td class="label">Дата примерки:</td>
          <td class="value">{{ formatDate(order.fitting_date) || "—" }}</td>
        </tr>
        <tr>
          <td class="label">Срок выполнения:</td>
          <td class="value">{{ formatDate(order.deadline_date) }}</td>
        </tr>
        <tr>
          <td class="label">Стоимость:</td>
          <td class="value">{{ formattedTotalCost }} ₽</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

const formattedTotalCost = computed(() => {
  if (props.order && props.order.total_cost) {
    const number = Number(props.order.total_cost);
    return isNaN(number) ? "0.00" : number.toFixed(2);
  }
  return "0.00";
});
</script>

<style scoped>
.section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.2rem;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr:not(:last-child) {
  border-bottom: 1px solid rgba(77, 72, 71, 0.1);
}

.info-table td {
  padding: 0.75rem 0;
}

.label {
  font-size: 0.9rem;
  color: var(--warm-gray);
  padding-right: 1rem;
  white-space: nowrap;
  vertical-align: top;
}

.value {
  font-weight: 500;
  color: var(--dark-teal);
  width: 100%;
}

@media (max-width: 768px) {
  .info-table {
    display: block;
  }
  
  .info-table tbody {
    display: block;
  }
  
  .info-table tr {
    display: block;
    padding: 0.75rem 0;
  }
  
  .info-table td {
    display: block;
    padding: 0.25rem 0;
  }
  
  .label {
    font-weight: 500;
    color: var(--dark-teal);
  }
}
</style>