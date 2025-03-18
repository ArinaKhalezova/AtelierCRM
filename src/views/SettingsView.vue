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
import MachineStatusesSection from "@/components/Settings/MachineStatusesSection.vue";
import PaymentMethodsSection from "@/components/Settings/PaymentMethodsSection .vue";

import { onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

onMounted(async () => {
  try {
    await store.dispatch("fetchJobPositions");
    await store.dispatch("fetchStatuses");
    await store.dispatch("fetchMaterialTypes");
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
