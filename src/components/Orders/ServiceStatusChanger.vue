<template>
  <div class="service-status">
    <select
      v-model="selectedStatus"
      @change="updateStatus"
      :disabled="loading"
      class="status-select"
    >
      <option v-for="status in serviceStatuses" :key="status" :value="status">
        {{ status }}
      </option>
    </select>
    <span v-if="loading" class="loading">Обновление...</span>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  serviceId: {
    type: Number,
    required: true,
    validator: (value) => Number.isInteger(value),
  },
  currentStatus: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["status-updated"]);

const store = useStore();
const loading = ref(false);
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

watch(
  () => props.currentStatus,
  (newVal) => {
    selectedStatus.value = newVal;
  }
);

const updateStatus = async () => {
  if (selectedStatus.value === props.currentStatus) return;

  loading.value = true;
  try {
    const success = await store.dispatch("orders/updateOrderServiceStatus", {
      serviceId: props.serviceId,
      status: selectedStatus.value,
    });

    if (success) {
      emit("status-updated", {
        serviceId: props.serviceId,
        newStatus: selectedStatus.value,
      });
    }
  } catch (error) {
    console.error("Error updating service status:", error);
    selectedStatus.value = props.currentStatus; // Возвращаем предыдущее значение
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.service-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--light-gray);
  font-size: 0.85rem;
}

.loading {
  font-size: 0.8rem;
  color: var(--warm-gray);
}
</style>
