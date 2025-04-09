<template>
  <div class="gantt-section">
    <h2>График заказов</h2>
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="ganttOrders.length === 0" class="empty">
      Нет активных заказов
    </div>
    <div v-else class="gantt-container">
      <!-- колонка для заголовка -->
      <div class="gantt-header">
        <div class="header-info"></div>
        <div v-for="day in ganttDays" :key="day.date" class="gantt-day">
          {{ day.label }}
        </div>
      </div>

      <div class="gantt-body">
        <div
          v-for="order in ganttOrders"
          :key="order.order_id"
          class="gantt-row"
        >
          <!-- Колонка с информацией -->
          <div class="order-info">
            <div>№ {{ order.tracking_number }}</div>
          </div>

          <!-- Область графика -->
          <div class="gantt-bars">
            <div
              class="gantt-bar"
              @click="goToOrder(order.order_id)"
              :style="{
                left: `${order.startPercent}%`,
                width: `${order.widthPercent}%`,
                background: getStatusColor(order.status),
              }"
              :title="`${order.tracking_number}: ${order.status} (${formatDate(
                order.created_at
              )} - ${formatDate(order.deadline_date)})`"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();
const isLoading = ref(true);
const isAdmin = computed(() => store.getters["auth/isAdmin"]);

const goToOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

const ganttDays = computed(() => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Нормализуем время

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 2);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 30);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d),
      label: d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      }),
    });
  }
  return days;
});

const ganttOrders = computed(() => {
  const orders = isAdmin.value
    ? store.getters["orders/allOrders"] || []
    : store.state.employeeOrders.orders || [];

  if (!ganttDays.value.length) return [];

  const firstDay = new Date(ganttDays.value[0].date);
  const lastDay = new Date(ganttDays.value[ganttDays.value.length - 1].date);
  const totalRange = lastDay - firstDay;

  return orders
    .filter((order) => {
      try {
        const validStatuses = isAdmin.value
          ? ["Новый", "Принят", "В работе", "Готов", "Отменен"]
          : ["Новый", "В работе", "Готов"];

        return (
          validStatuses.includes(order.status) &&
          order.created_at &&
          order.deadline_date
        );
      } catch {
        return false;
      }
    })
    .slice(0, 10)
    .map((order) => {
      try {
        const created = new Date(order.created_at);
        const deadline = new Date(order.deadline_date);

        // Убедимся, что даты корректны
        if (isNaN(created.getTime())) throw new Error("Invalid created date");
        if (isNaN(deadline.getTime())) throw new Error("Invalid deadline date");

        // Рассчитываем позицию начала относительно первого дня
        const startPos = Math.max(created - firstDay, 0);
        // Рассчитываем позицию конца (не может быть больше общего диапазона)
        const endPos = Math.min(deadline - firstDay, totalRange);

        // Ширина не может быть отрицательной
        const width = Math.max(endPos - startPos, 0);

        return {
          ...order,
          startPercent: (startPos / totalRange) * 100,
          widthPercent: (width / totalRange) * 100,
        };
      } catch (e) {
        console.error("Error processing order:", order.order_id, e);
        return null;
      }
    })
    .filter(Boolean);
});

const getStatusColor = (status) => {
  const colors = {
    Новый: "#8BAAAD",
    "В работе": "#FFA000",
    Готов: "#4CAF50",
    Выполнен: "#2E7D32",
    Отменен: "#DC3545",
  };
  return colors[status] || "#999";
};

onMounted(async () => {
  try {
    if (isAdmin.value) {
      await Promise.all([
        store.dispatch("orders/fetchOrders"),
        store.dispatch("orders/fetchOrdersCountByStatus"),
      ]);
    } else {
      await store.dispatch("employeeOrders/fetchOrders");
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.gantt-section {
  margin-top: 3rem;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.gantt-section h2 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
}

.gantt-container {
  overflow-x: auto;
}

.gantt-header {
  display: flex;
  margin-left: 145px;
  min-width: 1200px;
  border-bottom: 1px solid #eee;
}

.gantt-day {
  flex: 1;
  min-width: 40px;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: var(--warm-gray);
}

.gantt-body {
  min-width: 1200px;
  width: 95vw;
}

.gantt-row {
  display: flex;
  height: 40px;
  margin: 0.5rem 0;
  position: relative;
}

.order-info {
  width: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 1rem;
  font-size: 0.9rem;
}

.order-client {
  font-size: 0.8rem;
  color: var(--warm-gray);
}

.gantt-bars {
  flex: 1;
  position: relative;
  background: #f9f9f9;
}

.gantt-bar {
  position: absolute;
  height: 60%;
  top: 20%;
  border-radius: 4px;
  cursor: pointer;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  color: var(--warm-gray);
}
</style>
