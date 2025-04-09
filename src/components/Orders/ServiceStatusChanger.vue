<template>
  <div class="service-status-changer">
    <select
      v-model="selectedStatus"
      @change="updateServiceStatus"
      class="status-select"
      :class="`status-${selectedStatus.toLowerCase().replace(' ', '-')}`"
    >
      <option
        v-for="status in serviceStatuses"
        :key="status"
        :value="status"
        :class="`status-${status.toLowerCase().replace(' ', '-')}`"
      >
        {{ status }}
      </option>
    </select>
    <span v-if="isLoading" class="loading-indicator"></span>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  serviceId: {
    type: [String, Number],
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["status-updated"]);

const store = useStore();
const isLoading = ref(false);
const selectedStatus = ref(props.currentStatus);

const serviceStatuses = [
  "Новый",
  "Создание эскиза",
  "Изготовление выкройки",
  "На кройке",
  "На пошиве",
  "На примерке",
  "Доработка и отделка",
  "Исправляется",
  "В работе",
  "Готов",
];

const updateServiceStatus = async () => {
  try {
    isLoading.value = true;
    await store.dispatch("orderDetails/updateOrderServiceStatus", {
      serviceId: props.serviceId,
      status: selectedStatus.value,
    });
    emit("status-updated", {
      serviceId: props.serviceId,
      newStatus: selectedStatus.value,
    });
  } catch (error) {
    console.error("Ошибка обновления статуса услуги:", error);
    selectedStatus.value = props.currentStatus;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.service-status-changer {
  position: relative;
  display: flex;
  align-items: center;
}

.status-select {
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  padding-right: 1.8rem;
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
  transition: all 0.2s ease;
}

.status-select:hover {
  opacity: 0.9;
}

.status-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 170, 173, 0.3);
}

.loading-indicator {
  position: absolute;
  right: 0.5rem;
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid var(--teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Service status colors */
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
  background-color: rgba(255, 213, 79, 0.2);
  color: #ff8f00;
}
.status-готов {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
