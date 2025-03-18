<template>
  <div class="settings-view">
    <JobPositionsSection />
    <MaterialTypesSection />
    <PaymentMethodsSection />
    <StatusesSection />
    <MachineStatusesSection />
  </div>
</template>

<script setup>
import JobPositionsSection from "@/components/Settings/JobPositionsSection.vue";
import StatusesSection from "@/components/Settings/StatusesSection.vue";
import MaterialTypesSection from "@/components/Settings/MaterialTypesSection.vue";
import MachineStatusesSection from "@/components/Settings/MachineStatesSection.vue";
import PaymentMethodsSection from "@/components/Settings/PaymentMethodsSection .vue";

import { onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

onMounted(async () => {
  try {
    await store.dispatch("jobPositions/fetchJobPositions");
    await store.dispatch("statuses/fetchStatuses");
    await store.dispatch("materialTypes/fetchMaterialTypes");
    await store.dispatch("paymentMethods/fetchPaymentMethods");
    await store.dispatch("machineStates/fetchStates");
  } catch (err) {
    console.error("Ошибка при загрузке данных:", err);
  }
});
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
