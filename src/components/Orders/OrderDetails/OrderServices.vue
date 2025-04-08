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
          <ServiceStatusChanger
            :service-id="service.order_service_id"
            :current-status="service.status"
            @status-updated="handleServiceStatusUpdate"
          />
          <span class="quantity"
            >{{ service.quantity }} × {{ service.base_cost }} ₽</span
          >
          <span class="total"
            >{{ (service.quantity * service.base_cost).toFixed(2) }} ₽</span
          >
        </div>
        <button
          v-if="canEdit"
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
import ServiceStatusChanger from "../ServiceStatusChanger.vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  services: {
    type: Array,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["remove-service", "service-status-updated"]);

const handleServiceStatusUpdate = async () => {
  try {
    await store.dispatch(
      "orderDetails/fetchOrderServiceHistory",
      store.getters["orderDetails/currentOrder"]?.order_id
    );
  } catch (error) {
    console.error("Ошибка обновления истории:", error);
  }
};

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

.status-новый {
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}
.status-создание-эскиза {
  background-color: rgba(100, 181, 246, 0.2);
  color: #0d47a1;
}
.status-изготовление-выкройки {
  background-color: rgba(77, 182, 172, 0.2);
  color: #00695c;
}
.status-на-кройке {
  background-color: rgba(255, 213, 79, 0.2);
  color: #ff8f00;
}
.status-на-пошиве {
  background-color: rgba(255, 138, 101, 0.2);
  color: #e65100;
}
.status-на-примерке {
  background-color: rgba(186, 104, 200, 0.2);
  color: #6a1b9a;
}
.status-доработка-и-отделка {
  background-color: rgba(129, 199, 132, 0.2);
  color: #2e7d32;
}
.status-исправляется {
  background-color: rgba(239, 154, 154, 0.2);
  color: #c62828;
}
.status-в-работе {
  background-color: rgba(255, 160, 0, 0.2);
  color: #ff8f00;
}
.status-готов {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
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
