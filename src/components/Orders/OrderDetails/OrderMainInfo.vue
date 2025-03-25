<template>
  <div class="section">
    <h3>Основная информация</h3>
    <div class="grid">
      <div class="item">
        <span class="label">Клиент:</span>
        <span class="value">{{ order.client_name }}</span>
      </div>
      <div class="item">
        <span class="label">Телефон:</span>
        <span class="value">{{ order.client_phone || "—" }}</span>
      </div>
      <div class="item">
        <span class="label">Дата создания:</span>
        <span class="value">{{ formatDate(order.created_at) }}</span>
      </div>
      <div class="item">
        <span class="label">Дата примерки:</span>
        <span class="value">{{ formatDate(order.fitting_date) || "—" }}</span>
      </div>
      <div class="item">
        <span class="label">Срок выполнения:</span>
        <span class="value">{{ formatDate(order.deadline_date) }}</span>
      </div>
      <div class="item">
        <span class="label">Стоимость:</span>
        <span class="value">{{ formattedTotalCost }} ₽</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
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
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #555;
}

.value {
  color: #333;
}
</style>