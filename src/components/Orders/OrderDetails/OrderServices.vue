<template>
  <div class="section">
    <h3>Услуги</h3>
    <div v-if="services.length > 0" class="items">
      <div
        v-for="service in services"
        :key="service.order_service_id"
        class="item"
      >
        <div class="info">
          <span class="name">{{ service.service_name }}</span>
          <span class="status">{{ service.status }}</span>
          <span class="quantity"
            >{{ service.quantity }} × {{ service.base_cost }} ₽</span
          >
          <span class="total"
            >{{ (service.quantity * service.base_cost).toFixed(2) }} ₽</span
          >
        </div>
        <button
          @click="removeService(service.order_service_id)"
          class="btn danger"
        >
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
    required: true,
  },
});

const emit = defineEmits(["remove-service"]);

const removeService = (serviceId) => {
  emit("remove-service", serviceId);
};
</script>

<style scoped>
.section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.2rem;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(244, 255, 248, 0.3);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.item:hover {
  background-color: rgba(244, 255, 248, 0.5);
}

.info {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem 1.5rem;
}

.name {
  font-weight: 500;
  color: var(--dark-teal);
  grid-column: 1 / span 2;
}

.status {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}

.quantity,
.total {
  font-size: 0.9rem;
  color: var(--warm-gray);
}

.total {
  font-weight: 500;
  color: var(--dark-teal);
}

.btn.danger {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background-color: var(--danger);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn.danger:hover {
  background-color: #c82333;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--warm-gray);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .info {
    width: 100%;
    grid-template-columns: 1fr 1fr;
  }

  .btn.danger {
    width: 100%;
  }
}
</style>
