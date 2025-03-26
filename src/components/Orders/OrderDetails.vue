<template>
  <div class="order-details">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="order" class="content">
      <OrderHeader :order="order" />

      <OrderMainInfo :order="order" />

      <OrderServices :services="services" @remove-service="removeService" />

      <OrderMaterials
        :materials="materials"
        @remove-material="removeMaterial"
      />

      <OrderComment v-if="order.comment" :comment="order.comment" />

      <OrderMeasurements
        :measurements="measurements"
        :order-id="orderId"
        @saved="fetchMeasurements"
      />

      <OrderActions
        :order-id="orderId"
        @edit="editOrder"
        @delete="deleteOrder"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import OrderHeader from "./OrderDetails/OrderHeader.vue";
import OrderMainInfo from "./OrderDetails/OrderMainInfo.vue";
import OrderServices from "./OrderDetails/OrderServices.vue";
import OrderMaterials from "./OrderDetails/OrderMaterials.vue";
import OrderComment from "./OrderDetails/OrderComment.vue";
import OrderMeasurements from "./OrderDetails/OrderMeasurements.vue";
import OrderActions from "./OrderDetails/OrderActions.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

// Загрузка данных
onMounted(async () => {
  try {
    await store.dispatch("orderDetails/fetchFullOrderDetails", orderId);
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

const editOrder = () => {
  router.push(`/orders/${orderId}/edit`);
};

const deleteOrder = async () => {
  if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
    try {
      const success = await store.dispatch("orders/deleteOrder", props.orderId);
      if (success) {
        router.push("/orders"); // Переходим к списку после удаления
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }
};

const updateServiceStatus = async (serviceId, status) => {
  try {
    await store.dispatch("orderDetails/updateOrderServiceStatus", {
      serviceId,
      status,
    });
  } catch (error) {
    console.error("Ошибка обновления статуса услуги:", error);
    store.commit("orderDetails/SET_ERROR", "Ошибка обновления статуса услуги");
  }
};
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
</style>
