<template>
  <div class="section">
    <h3>Услуги</h3>
    <div v-if="services.length > 0" class="items">
      <div v-for="service in services" :key="service.order_service_id" class="item">
        <div class="info">
          <span class="name">{{ service.service_name }}</span>
          <span class="status">{{ service.status }}</span>
          <span class="quantity">{{ service.quantity }} × {{ service.base_cost }} ₽</span>
          <span class="total">{{ (service.quantity * service.base_cost).toFixed(2) }} ₽</span>
        </div>
        <button @click="removeService(service.order_service_id)" class="btn danger">
          Удалить
        </button>
      </div>
    </div>
    <div v-else class="empty">Нет услуг</div>
  </div>
</template>

<script setup>
defineProps({
  services: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['remove-service']);

const removeService = (serviceId) => {
  emit('remove-service', serviceId);
};
</script>

<style scoped>
.items .item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.info {
  display: grid;
  gap: 5px;
  flex-grow: 1;
}

.quantity,
.total {
  font-size: 0.9em;
  color: #666;
}

.btn.danger {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  background: #d32f2f;
  color: white;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>