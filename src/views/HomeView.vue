<template>
  <div class="home-view">
    <div v-if="loading" class="global-loading">Загрузка...</div>
    <div v-else-if="error" class="global-error">{{ error }}</div>
    <div v-else class="welcome-banner">
      <h1>Добро пожаловать</h1>
      <p>Сегодня: {{ currentDate }}</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-content">
          <div class="metric-icon in-progress">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="metric-info">
            <h3>В работе</h3>
            <p class="metric-value">{{ activeOrdersCount }}</p>
          </div>
        </div>
        <router-link to="/orders?status=в работе" class="metric-link"
          >Посмотреть все →</router-link
        >
      </div>

      <div class="metric-card">
        <div class="metric-content">
          <div class="metric-icon waiting">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="cross-line"
              />
            </svg>
          </div>
          <div class="metric-info">
            <h3>В очереди</h3>
            <p class="metric-value">{{ notStartedOrdersCount }}</p>
          </div>
        </div>
        <router-link to="/orders?status=ожидает" class="metric-link"
          >Посмотреть все →</router-link
        >
      </div>
    </div>

    <div>
      <Timeline />
      <Gant />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Timeline from "@/components/Home/Timeline.vue";
import Gant from "@/components/Home/Gant.vue";

const loading = ref(true);
const error = ref(null);
const store = useStore();

const currentDate = new Date().toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const activeOrdersCount = computed(
  () => store.getters["orders/activeOrdersCount"]
);
const notStartedOrdersCount = computed(
  () => store.getters["orders/notStartedOrdersCount"]
);

onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch("orders/fetchOrders"),
      store.dispatch("orders/fetchOrdersCountByStatus"),
    ]);
  } catch (e) {
    error.value = "Ошибка загрузки данных";
    console.error("HomeView error:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-banner h1 {
  font-size: 2.5rem;
  color: var(--dark-teal);
  margin: 0;
  font-weight: 500;
}

.welcome-banner p {
  font-size: 1.1rem;
  color: var(--warm-gray);
  margin: 0.5rem 0 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.metric-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.in-progress {
  background-color: rgba(139, 170, 173, 0.1);
  color: var(--teal);
}

.metric-icon.waiting {
  background-color: rgba(77, 72, 71, 0.1);
  color: var(--warm-gray);
}

.metric-icon.waiting .cross-line {
  stroke: var(--danger);
}

.metric-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--dark-teal);
  font-weight: 500;
}

.metric-value {
  font-size: 2.5rem;
  margin: 0.5rem 0 0;
  color: var(--dark-teal);
  font-weight: 600;
}

.metric-link {
  display: block;
  text-align: right;
  color: var(--teal);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.metric-link:hover {
  color: var(--dark-teal);
}

@media (max-width: 768px) {
  .welcome-banner h1 {
    font-size: 2rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-content {
    gap: 1rem;
  }

  .metric-icon {
    width: 50px;
    height: 50px;
  }

  .metric-value {
    font-size: 2rem;
  }
}
</style>
