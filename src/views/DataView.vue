<template>
  <div class="data-view">
    <h1>Данные из базы данных</h1>
    <ClientsTable :clients="clients" />
    <JobPositionsTable :jobPositions="jobPositions" />
    <MaterialTypesTable :materialTypes="materialTypes" />
    <PaymentMethodsTable :paymentMethods="paymentMethods" />
    <StatusesTable :statuses="statuses" />
    <StatesTable :states="states" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";
import ClientsTable from "@/components/DataView/ClientsTable.vue";
import JobPositionsTable from "@/components/DataView/JobPositionsTable.vue";
import StatusesTable from "@/components/DataView/StatusesTable.vue";
import MaterialTypesTable from "@/components/DataView/MaterialTypesTable.vue";
import PaymentMethodsTable from "@/components/DataView/PaymentMethodsTable.vue";
import StatesTable from "@/components/DataView/StatesTable.vue";

const clients = ref([]);
const jobPositions = ref([]);
const statuses = ref([]);
const materialTypes = ref([]);
const states = ref([]);
const paymentMethods = ref([]);

onMounted(async () => {
  try {
    const clientsResponse = await api.getClients();
    clients.value = clientsResponse.data;

    const positionsResponse = await api.getJobPositions();
    jobPositions.value = positionsResponse.data;

    const statusesResponse = await api.getStatuses();
    statuses.value = statusesResponse.data;

    const materialTypesResponse = await api.getMaterialTypes();

    const statesResponse = await api.getStates();
    states.value = statesResponse.data;

    const paymentMethodsResponse = await api.getPaymentMethods();
    paymentMethods.value = paymentMethodsResponse.data;

    materialTypes.value = materialTypesResponse.data;
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
