<template>
  <div class="orders-tab">
    <div class="header">
      <h2>Мои заказы</h2>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label for="search">Поиск по номеру:</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Введите номер заказа"
        />
      </div>

      <div class="filter-group">
        <label for="status">Статус:</label>
        <select id="status" v-model="selectedStatus">
          <option value="">Все статусы</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <button @click="resetFilters" class="reset-filters">
        Сбросить фильтры
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" class="close-error">×</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loader"></div>
    </div>
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      {{
        searchQuery || selectedStatus
          ? "Заказы не найдены"
          : "Вам пока не назначены заказы"
      }}
    </div>
    <div v-else class="table-wrapper">
      <div class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th @click="sortBy('created_at')">
                Дата создания
                <span v-if="sortField === 'created_at'" class="sort-icon">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th>Номер</th>
              <th>Клиент</th>
              <th @click="sortBy('deadline_date')">
                Срок выполнения
                <span v-if="sortField === 'deadline_date'" class="sort-icon">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th @click="sortBy('status')">
                Статус
                <span v-if="sortField === 'status'" class="sort-icon">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th>Стоимость</th>
              <th class="actions-column">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in sortedAndFilteredOrders" :key="order.order_id">
              <td data-label="Дата создания">
                {{ formatDate(order.created_at) }}
              </td>
              <td data-label="Номер">№ {{ order.tracking_number }}</td>
              <td data-label="Клиент">{{ order.client_name }}</td>
              <td data-label="Срок выполнения">
                {{ formatDate(order.deadline_date) }}
              </td>
              <td data-label="Статус">
                <span
                  class="status"
                  :class="order.status.toLowerCase().replace(' ', '-')"
                >
                  {{ order.status }}
                </span>
              </td>
              <td data-label="Стоимость">{{ order.total_cost }} ₽</td>
              <td class="actions-column" data-label="Действия">
                <router-link
                  :to="`/orders/${order.order_id}`"
                  class="action-button"
                >
                  Подробнее
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

const searchQuery = ref("");
const selectedStatus = ref("");
const sortField = ref("created_at");
const sortDirection = ref("desc");

const statuses = [
  "Новый",
  "Принят",
  "В работе",
  "Готов",
  "Выполнен",
  "Отменен",
];

const orders = computed(() => store.state.employeeOrders?.orders || []);
const isLoading = computed(() => store.state.employeeOrders?.loading || false);
const error = computed(() => store.state.employeeOrders?.error || null);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

const clearError = () => {
  store.commit("employeeOrders/SET_ERROR", null);
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesSearch = order.tracking_number
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus = selectedStatus.value
      ? order.status === selectedStatus.value
      : true;
    return matchesSearch && matchesStatus;
  });
});

const sortedAndFilteredOrders = computed(() => {
  const orders = [...filteredOrders.value];

  return orders.sort((a, b) => {
    let comparison = 0;

    if (
      sortField.value === "created_at" ||
      sortField.value === "deadline_date"
    ) {
      const dateA = new Date(a[sortField.value]);
      const dateB = new Date(b[sortField.value]);
      comparison = dateA - dateB;
    } else if (sortField.value === "status") {
      const indexA = statuses.indexOf(a.status);
      const indexB = statuses.indexOf(b.status);
      comparison = indexA - indexB;
    }

    return sortDirection.value === "asc" ? comparison : -comparison;
  });
});

onMounted(async () => {
  console.log("Fetching assigned orders...");
  try {
    await store.dispatch("employeeOrders/fetchOrders");
    console.log("Orders fetched:", store.state.employeeOrders.orders);

    if (store.state.employeeOrders.orders.length === 0) {
      console.warn("No orders found, but request was successful");
    }
  } catch (e) {
    console.error("Failed to load orders:", {
      message: e.message,
      response: e.response?.data,
    });
  }
});
</script>

<style scoped>
.orders-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

h2 {
  color: var(--dark-teal);
  margin: 0;
  font-size: 1.5rem;
}

.add-button {
  background-color: var(--success);
  color: white;
  border: 1px;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.add-button:hover {
  background-color: var(--dark-success);
  opacity: 0.95;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--danger);
}

.table-wrapper {
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  width: 100%;
  overflow: auto;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.orders-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: var(--border);
}

.orders-table th {
  background-color: var(--dark-teal);
  color: white;
  position: sticky;
  top: 0;
  font-weight: 500;
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.orders-table tr:hover {
  background-color: rgba(139, 170, 173, 0.05);
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}
.status.новый {
  background-color: rgb(186, 216, 220);
  color: #ffffff;
}

.status.принят {
  background-color: rgb(158, 230, 172);
  color: #ffffff;
}
.status.в-работе {
  background-color: rgb(255, 190, 77);
  color: #ffffff;
}
.status.готов {
  background-color: rgb(48, 194, 89);
  color: #ffffff;
}
.status.выполнен {
  background-color: rgb(15, 159, 82);
  color: #ffffff;
}
.status.отменен {
  background-color: rgb(139, 18, 18);
  color: white;
}

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.action-button {
  background-color: var(--info);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--dark-info);
}

.delete-button {
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #c82333;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--teal);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--warm-gray);
  font-size: 1.1rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: var(--dark-teal);
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: var(--border);
  border-radius: var(--border-radius);
  min-width: 200px;
}

.reset-filters {
  background-color: white;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.6rem;
}

.reset-filters:hover {
  background-color: var(--dark-danger);
  color: white;
}

.sort-icon {
  margin-left: 0.3rem;
  font-weight: bold;
}

th {
  cursor: pointer;
  user-select: none;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group input,
  .filter-group select {
    width: 100%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .orders-table {
    display: block;
    width: 100%;
  }

  .orders-table thead {
    display: none;
  }

  .orders-table tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: var(--border);
    padding: 0.5rem;
  }

  .orders-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: none;
    text-align: right;
  }

  .orders-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
    color: var(--dark-teal);
  }

  .actions-column {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
