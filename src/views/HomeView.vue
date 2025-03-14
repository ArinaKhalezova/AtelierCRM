<template>
  <div class="home-view">
    <div class="welcome-banner">
      <h2>Добро пожаловать в CRM ателье!</h2>
      <p>Управляйте заказами, материалами и исполнителями в одном месте</p>
    </div>

    <div class="quick-stats">
      <div class="stat-card">
        <h3>Активные заказы</h3>
        <p class="stat-value">{{ activeOrdersCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Заказы не взяты в работу</h3>
        <p class="stat-value">{{ notStartedOrdersCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Доступные материалы</h3>
        <p class="stat-value">{{ materialsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Исполнители</h3>
        <p class="stat-value">{{ executorsCount }}</p>
      </div>
    </div>

    <div class="clients-list">
      <h3>Список клиентов</h3>
      <ul>
        <li v-for="client in clients" :key="client.client_id">
          {{ client.fullname }} - {{ client.phone_number }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import api from "@/services/api";

const store = useStore();

const clients = ref([]);

const allClients = computed(() => store.getters.allClients);
const allOrders = computed(() => store.getters.allOrders);
const allMaterials = computed(() => store.getters.allMaterials);
const allExecutors = computed(() => store.getters.allExecutors);

const activeOrdersCount = computed(
  () =>
    allOrders.value?.filter((order) => order.status === "в процессе").length ||
    0
);
const notStartedOrdersCount = computed(
  () =>
    allOrders.value?.filter((order) => order.status === "взять в работу")
      .length || 0
);
const materialsCount = computed(() => allMaterials.value?.length || 0);
const executorsCount = computed(() => allExecutors.value?.length || 0);

onMounted(async () => {
  try {
    const response = await api.getClients();
    console.log("Clients data:", response.data);
    clients.value = response.data;
  } catch (error) {
    console.error("Ошибка при загрузке клиентов:", error);
  }
});
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background-image: url(../assets/img/background.jpg);
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-banner img {
  width: 2000px;
  height: 1500px;
  overflow: hidden;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  color: var(--secondary-color);
  margin: 1rem 0 0;
}
</style>
