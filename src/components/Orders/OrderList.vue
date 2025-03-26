<template>
  <div class="orders-tab">
    <div class="header">
      <h2>Заказы</h2>
      <router-link to="/orders/new" class="add-button">
        <span class="plus-icon">+</span> Новый заказ
      </router-link>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" class="close-error">×</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loader"></div>
    </div>
    <div v-else-if="orders.length === 0" class="empty-state">Нет заказов</div>
    <div v-else class="table-wrapper">
      <div class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Дата создания</th>
              <th>Срок выполнения</th>
              <th>Статус</th>
              <th>Стоимость</th>
              <th class="actions-column">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.order_id">
              <td data-label="Номер">№ {{ order.tracking_number }}</td>
              <td data-label="Клиент">{{ order.client_name }}</td>
              <td data-label="Дата создания">
                {{ formatDate(order.created_at) }}
              </td>
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
                <button
                  @click="deleteOrder(order.order_id)"
                  class="delete-button"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const orders = computed(() => store.getters["orders/allOrders"]);
const isLoading = computed(() => store.getters["orders/isLoading"]);
const error = computed(() => store.getters["orders/error"]);

onMounted(() => {
  store.dispatch("orders/fetchOrders");
});

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

const clearError = () => {
  store.commit("orders/SET_ERROR", null);
};

const deleteOrder = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;

  try {
    const success = await store.dispatch("orders/deleteOrder", id);
    if (success) {
      await store.dispatch("orders/fetchOrders"); // Обновляем список только при успехе
    }
  } catch (error) {
    console.error("Delete error:", error);
    // Ошибка уже обработана в хранилище
  }
};
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
  background-color: var(--dark-teal);
  color: white;
  border: none;
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
  background-color: #244a4b;
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
  background-color: rgba(139, 170, 173, 0.2);
  color: var(--dark-teal);
}
.status.в-работе {
  background-color: rgba(255, 160, 0, 0.2);
  color: #ff8f00;
}
.status.готов {
  background-color: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}
.status.выполнен {
  background-color: rgba(46, 125, 50, 0.2);
  color: #1b5e20;
}
.status.отменен {
  background-color: rgba(220, 53, 69, 0.2);
  color: var(--danger);
}

.actions-column {
  white-space: nowrap;
  width: 1%;
}

.action-button {
  background-color: var(--teal);
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
  background-color: #7a9b9e;
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
