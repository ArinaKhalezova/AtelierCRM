<template>
  <div class="order-details">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="order" class="content">
      <div class="header">
        <button @click="$router.push('/orders')" class="btn back">
          ← Назад
        </button>
        <h2>Заказ № {{ order.tracking_number }}</h2>
        <div class="status" :class="order.status.toLowerCase()">
          {{ order.status }}
        </div>
      </div>

      <div class="section">
        <h3>Основная информация</h3>
        <div class="grid">
          <div class="item">
            <span class="label">Клиент:</span>
            <span class="value">{{ order.client_name }}</span>
          </div>
          <div class="item">
            <span class="label">Дата создания:</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="item">
            <span class="label">Дата примерки:</span>
            <span class="value">{{
              formatDate(order.fitting_date) || "—"
            }}</span>
          </div>
          <div class="item">
            <span class="label">Срок выполнения:</span>
            <span class="value">{{ formatDate(order.deadline_date) }}</span>
          </div>
          <div class="item">
            <span class="label">Стоимость:</span>
            <span class="value">{{ order.total_cost }} ₽</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Услуги</h3>
        <div v-if="services.length > 0" class="items">
          <div
            v-for="service in services"
            :key="service.order_service_id"
            class="item"
          >
            <div class="info">
              <span class="name">{{ service.service_name }}</span>
              <span class="quantity"
                >{{ service.quantity }} × {{ service.base_cost }} ₽</span
              >
              <span class="total"
                >{{ service.quantity * service.base_cost }} ₽</span
              >
            </div>
            <button
              @click="removeService(service.order_service_id)"
              class="btn danger"
            >
              Удалить
            </button>
          </div>
        </div>
        <div v-else class="empty">Нет услуг</div>
      </div>

      <div class="section">
        <h3>Материалы</h3>
        <div v-if="materials.length > 0" class="items">
          <div
            v-for="material in materials"
            :key="material.order_material_id"
            class="item"
          >
            <div class="info">
              <span class="name">{{ material.material_name }}</span>
              <span class="quantity">
                {{ material.quantity }} {{ material.unit }} ×
                {{ material.cost_per_unit }} ₽
              </span>
              <span class="total"
                >{{ material.quantity * material.cost_per_unit }} ₽</span
              >
            </div>
            <button
              @click="removeMaterial(material.order_material_id)"
              class="btn danger"
            >
              Удалить
            </button>
          </div>
        </div>
        <div v-else class="empty">Нет материалов</div>
      </div>

      <div v-if="order.comment" class="section">
        <h3>Комментарий</h3>
        <div class="comment">{{ order.comment }}</div>
      </div>

      <div class="actions">
        <button @click="editOrder" class="btn primary">Редактировать</button>
        <button @click="deleteOrder" class="btn danger">Удалить заказ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const route = useRoute();
const router = useRouter();

const orderId = route.params.id;

onMounted(() => {
  store.dispatch("orders/fetchOrderDetails", orderId);
});

const order = computed(() => store.getters["orders/currentOrder"]);
const services = computed(() => store.getters["orders/orderServices"]);
const materials = computed(() => store.getters["orders/orderMaterials"]);
const isLoading = computed(() => store.getters["orders/isLoading"]);
const error = computed(() => store.getters["orders/error"]);

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

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

const removeMaterial = async (orderMaterialId) => {
  if (confirm("Удалить этот материал из заказа?")) {
    try {
      await store.dispatch("orders/removeMaterialFromOrder", {
        orderId: orderId,
        materialId: orderMaterialId,
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.status.new {
  background: #e3f2fd;
  color: #1976d2;
}

.status.in-progress {
  background: #fff8e1;
  color: #ff8f00;
}

.status.completed {
  background: #e8f5e9;
  color: #388e3c;
}

.section {
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #555;
}

.items .item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  display: grid;
  gap: 5px;
}

.quantity,
.total {
  font-size: 0.9em;
  color: #666;
}

.comment {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn.back {
  background: transparent;
  color: #1976d2;
}

.btn.primary {
  background: #1976d2;
  color: white;
}

.btn.danger {
  background: #d32f2f;
  color: white;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.error {
  color: #d32f2f;
}
</style>
