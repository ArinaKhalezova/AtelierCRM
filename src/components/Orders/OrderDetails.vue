<template>
  <div class="order-details">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="order" class="content">
      <OrderHeader :order="order" :is-admin="isAdmin" />

      <OrderMainInfo :order="order" />

      <OrderEmployees
        :order-id="orderId"
        :can-edit="isAdmin"
        v-if="
          order && order.status !== 'Выполнен' && order.status !== 'Отменен'
        "
      />

      <OrderServices
        :services="services"
        @remove-service="remove - service"
        @status-updated="handleStatusUpdated"
        :can-edit="isAdmin"
      />

      <OrderMaterials
        :materials="materials"
        @remove-material="removeMaterial"
        :can-edit="isAdmin"
      />

      <OrderComment v-if="order.comment" :comment="order.comment" />

      <FittingsList :order-id="orderId" :can-edit="isAdmin || !isAdmin" />

      <OrderMeasurements
        :measurements="measurements"
        :order-id="orderId"
        @saved="fetchMeasurements"
      />

      <div class="actions">
        <button @click="editOrder(order.order_id)" class="btn primary">
          Редактировать заказ
        </button>
        <button
          v-if="isAdmin"
          @click="deleteOrder(order.order_id)"
          class="btn danger"
        >
          Удалить заказ
        </button>
      </div>

      <EditOrderModal
        v-if="isEditModalOpen"
        :is-open="isEditModalOpen"
        :order="order"
        @close="closeEditModal"
        @success="handleEditSuccess"
      />

      <OrderHistory v-if="orderHistory.length > 0" :history="orderHistory" />

      <ServiceHistory
        v-if="serviceHistory.length > 0"
        :history="serviceHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import OrderHeader from "./OrderDetails/OrderHeader.vue";
import OrderMainInfo from "./OrderDetails/OrderMainInfo.vue";
import OrderEmployees from "./OrderDetails/OrderEmployees.vue";
import OrderServices from "./OrderDetails/OrderServices.vue";
import OrderMaterials from "./OrderDetails/OrderMaterials.vue";
import OrderComment from "./OrderDetails/OrderComment.vue";
import OrderMeasurements from "./OrderDetails/OrderMeasurements.vue";
import EditOrderModal from "./OrderDetails/EditOrderModal.vue";
import OrderHistory from "./OrderDetails/OrderHistory.vue";
import ServiceHistory from "./OrderDetails/ServiceHistory.vue";
import FittingsList from "./OrderDetails/FittingsList.vue";

const store = useStore();
const isAdmin = computed(() => store.getters["auth/isAdmin"]);

const route = useRoute();
const router = useRouter();
const orderId = Number(route.params.id);
const isEditModalOpen = ref(false);

const fetchMeasurements = async () => {
  try {
    await store.dispatch("orderDetails/fetchMeasurements", orderId);
  } catch (error) {
    console.error("Ошибка загрузки мерок:", error);
  }
};

// Геттеры
const order = computed(() => store.getters["orderDetails/currentOrder"]);
const services = computed(() => store.getters["orderDetails/orderServices"]);
const materials = computed(() => store.getters["orderDetails/orderMaterials"]);
const measurements = computed(() => store.getters["orderDetails/measurements"]);
const isLoading = computed(() => store.getters["orderDetails/isLoading"]);
const error = computed(() => store.getters["orderDetails/error"]);
const orderHistory = computed(() => store.getters["orderDetails/orderHistory"]);
const serviceHistory = computed(
  () => store.getters["orderDetails/serviceHistory"]
);

// Методы
const removeService = async (serviceId) => {
  if (confirm("Удалить эту услугу из заказа?")) {
    try {
      await store.dispatch("orderDetails/removeServiceFromOrder", {
        orderId: orderId,
        serviceId: serviceId,
      });
    } catch (error) {
      console.error("Ошибка удаления услуги:", error);
      store.commit("orderDetails/SET_ERROR", "Ошибка удаления услуги");
    }
  }
};

const removeMaterial = async (materialId) => {
  if (confirm("Удалить этот материал из заказа?")) {
    try {
      await store.dispatch("orderDetails/removeMaterialFromOrder", {
        orderId: orderId,
        materialId: materialId,
      });
    } catch (error) {
      console.error("Ошибка удаления материала:", error);
      store.commit("orderDetails/SET_ERROR", "Ошибка удаления материала");
    }
  }
};

const editOrder = (id) => {
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const handleEditSuccess = () => {
  store.dispatch("orderDetails/fetchFullOrderDetails", orderId);
};

const handleStatusUpdated = async () => {
  try {
    await store.dispatch("orderDetails/fetchOrderServiceHistory", orderId);
  } catch (error) {
    console.error("Ошибка обновления истории услуг:", error);
  }
};

const deleteOrder = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;

  try {
    const success = await store.dispatch("orders/deleteOrder", id);

    if (success) {
      await router.push({
        path: "/orders",
        query: { deleted: id },
      });
    }
  } catch (error) {
    console.error("Delete error:", error);

    if (
      error.response?.status === 400 &&
      error.response?.data?.error?.includes("Нельзя удалить заказ в статусе")
    ) {
      alert(error.response.data.error);
    } else {
      alert(
        error.response?.data?.error ||
          error.message ||
          "Ошибка при удалении заказа"
      );
    }
  }
};

// Загрузка данных
onMounted(async () => {
  try {
    await store.dispatch("orderDetails/fetchFullOrderDetails", orderId);
    await store.dispatch("orderDetails/fetchOrderHistory", orderId);
    await store.dispatch("orderDetails/fetchOrderServiceHistory", orderId);
  } catch (error) {
    console.error("Ошибка загрузки данных:", {
      message: error.message,
      response: error.response?.data,
    });
    store.commit(
      "orderDetails/SET_ERROR",
      error.response?.data?.message || "Ошибка загрузки данных заказа"
    );
  }
});
</script>

<style scoped>
.order-details {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading {
  padding: 3rem;
  text-align: center;
}

.error {
  padding: 1.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: var(--border-radius);
  color: var(--danger);
  text-align: center;
}
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.85rem 1.75rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.btn.primary {
  background-color: var(--teal);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-teal);
}

.btn.danger {
  background-color: white;
  border: 1px solid var(--danger);
  color: var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}
</style>
