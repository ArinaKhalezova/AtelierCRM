<template>
  <div class="data-view">
    <h1>Данные из базы данных</h1>
    <ClientsTable :clients="clients" />
    <JobPositionsTable :jobPositions="jobPositions" />
    <MaterialTypesTable :materialTypes="materialTypes" />
    <PaymentMethodsTable :paymentMethods="paymentMethods" />
    <StatusesTable :statuses="statuses" />
    <StatesTable :states="states" />
    <SuppliersTable :suppliers="suppliers" />
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import api from "@/services/api";
import { useStore } from "vuex";
import ClientsTable from "@/components/DataView/ClientsTable.vue";
import JobPositionsTable from "@/components/DataView/JobPositionsTable.vue";
import StatusesTable from "@/components/DataView/StatusesTable.vue";
import MaterialTypesTable from "@/components/DataView/MaterialTypesTable.vue";
import PaymentMethodsTable from "@/components/DataView/PaymentMethodsTable.vue";
import StatesTable from "@/components/DataView/StatesTable.vue";
import SuppliersTable from "@/components/DataView/SuppliersTable.vue";

const store = useStore();

const clients = computed(() => store.state.clients);
const jobPositions = computed(() => store.state.jobPositions);
const statuses = computed(() => store.state.statuses);
const materialTypes = computed(() => store.state.materialTypes);
const paymentMethods = computed(() => store.state.paymentMethods);
const states = computed(() => store.state.machineStates);
const suppliers = computed(() => store.state.suppliers);

onMounted(async () => {
  try {
    await store.dispatch("jobPositions/fetchJobPositions");
    await store.dispatch("statuses/fetchStatuses");
    await store.dispatch("materialTypes/fetchMaterialTypes");
    await store.dispatch("paymentMethods/fetchPaymentMethods");
    await store.dispatch("machineStates/fetchStates");
    await store.dispatch("suppliers/fetchSuppliers");
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
});
</script>

<style scoped>
.data-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
