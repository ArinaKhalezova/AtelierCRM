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
import { ref, computed, onMounted } from "vue";
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
    await store.dispatch("orders/fetchOrderDetails", orderId);
    await fetchMeasurements();
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
});

const fetchMeasurements = async () => {
  try {
    await store.dispatch("orders/fetchMeasurements", orderId);
  } catch (error) {
    console.error("Ошибка загрузки мерок:", error);
  }
};

// Геттеры
const order = computed(() => store.getters["orders/currentOrder"]);
const services = computed(() => store.getters["orders/orderServices"]);
const materials = computed(() => store.getters["orders/orderMaterials"]);
const measurements = computed(() => store.getters["orders/measurements"]);
const isLoading = computed(() => store.getters["orders/isLoading"]);
const error = computed(() => store.getters["orders/error"]);

// Методы
const removeService = async (serviceId) => {
  if (confirm("Удалить эту услугу из заказа?")) {
    try {
      await store.dispatch("orders/removeServiceFromOrder", {
        orderId: orderId,
        serviceId: serviceId,
      });
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  }
};

const removeMaterial = async (materialId) => {
  if (confirm("Удалить этот материал из заказа?")) {
    try {
      await store.dispatch("orders/removeMaterialFromOrder", {
        orderId: orderId,
        materialId: materialId,
      });
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  }
};

const editOrder = () => {
  router.push(`/orders/${orderId}/edit`);
};

const deleteOrder = async () => {
  if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
    try {
      await store.dispatch("orders/deleteOrder", orderId);
      router.push("/orders");
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
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
