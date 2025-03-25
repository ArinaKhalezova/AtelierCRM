<template>
  <div class="order-details">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="order" class="content">
      <!-- Шапка заказа -->
      <div class="header">
        <button @click="$router.push('/orders')" class="btn back">
          ← Назад
        </button>
        <h2>Заказ № {{ order.tracking_number }}</h2>
        <div
          class="status"
          :class="order.status.toLowerCase().replace(' ', '-')"
        >
          {{ order.status }}
        </div>
      </div>

      <!-- Основная информация -->
      <div class="section">
        <h3>Основная информация</h3>
        <div class="grid">
          <div class="item">
            <span class="label">Клиент:</span>
            <span class="value">{{ order.client_name }}</span>
          </div>
          <div class="item">
            <span class="label">Телефон:</span>
            <span class="value">{{ order.client_phone || "—" }}</span>
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
            <span class="value">{{ formattedTotalCost }} ₽</span>
          </div>
        </div>
      </div>

      <!-- Услуги -->
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
              <span class="status">{{ service.status }}</span>
              <span class="quantity"
                >{{ service.quantity }} × {{ service.base_cost }} ₽</span
              >
              <span class="total"
                >{{ (service.quantity * service.base_cost).toFixed(2) }} ₽</span
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

      <!-- Материалы -->
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
                >{{
                  (material.quantity * material.cost_per_unit).toFixed(2)
                }}
                ₽</span
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

      <!-- Комментарий -->
      <div v-if="order.comment" class="section">
        <h3>Комментарий</h3>
        <div class="comment">{{ order.comment }}</div>
      </div>

      <!-- Мерки клиента -->
      <div class="section">
        <h3>Мерки клиента</h3>
        <div v-if="showMeasurementsForm" class="measurements-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Размер:</label>
              <input
                v-model="localMeasurements.size"
                type="text"
                placeholder="Введите размер"
              />
            </div>

            <div class="form-group">
              <label>Обхват груди (см):</label>
              <input
                v-model.number="localMeasurements.chest_size"
                type="number"
                step="0.1"
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Обхват талии (см):</label>
              <input
                v-model.number="localMeasurements.waist_size"
                type="number"
                step="0.1"
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Обхват бедер (см):</label>
              <input
                v-model.number="localMeasurements.hip_size"
                type="number"
                step="0.1"
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Ширина плеч (см):</label>
              <input
                v-model.number="localMeasurements.shoulders_width"
                type="number"
                step="0.1"
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Рост (см):</label>
              <input
                v-model.number="localMeasurements.height"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveMeasurements" class="btn primary">
              {{ measurements ? "Обновить" : "Сохранить" }}
            </button>
            <button @click="cancelMeasurementsEdit" class="btn outline">
              Отмена
            </button>
          </div>
        </div>

        <div v-else class="measurements-view">
          <div v-if="measurements" class="measurements-grid">
            <div v-if="measurements.size" class="measurement-item">
              <span class="label">Размер:</span>
              <span class="value">{{ measurements.size }}</span>
            </div>
            <div v-if="measurements.chest_size" class="measurement-item">
              <span class="label">Обхват груди:</span>
              <span class="value">{{ measurements.chest_size }} см</span>
            </div>
            <div v-if="measurements.waist_size" class="measurement-item">
              <span class="label">Обхват талии:</span>
              <span class="value">{{ measurements.waist_size }} см</span>
            </div>
            <div v-if="measurements.hip_size" class="measurement-item">
              <span class="label">Обхват бедер:</span>
              <span class="value">{{ measurements.hip_size }} см</span>
            </div>
            <div v-if="measurements.shoulders_width" class="measurement-item">
              <span class="label">Ширина плеч:</span>
              <span class="value">{{ measurements.shoulders_width }} см</span>
            </div>
            <div v-if="measurements.height" class="measurement-item">
              <span class="label">Рост:</span>
              <span class="value">{{ measurements.height }} см</span>
            </div>
          </div>
          <div v-else class="empty">Мерки не указаны</div>

          <button @click="editMeasurements" class="btn primary">
            {{ measurements ? "Редактировать мерки" : "Добавить мерки" }}
          </button>
        </div>
      </div>

      <!-- Действия с заказом -->
      <div class="actions">
        <button @click="editOrder" class="btn primary">
          Редактировать заказ
        </button>
        <button @click="deleteOrder" class="btn danger">Удалить заказ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

// Состояния формы
const showMeasurementsForm = ref(false);
const localMeasurements = ref({
  size: "",
  chest_size: null,
  waist_size: null,
  hip_size: null,
  shoulders_width: null,
  height: null,
});

const formattedTotalCost = computed(() => {
  if (order.value && order.value.total_cost) {
    const number = Number(order.value.total_cost);
    return isNaN(number) ? "0.00" : number.toFixed(2);
  }
  return "0.00";
});

const fetchMeasurements = async () => {
  try {
    await store.dispatch("orders/fetchMeasurements", orderId);
    if (measurements.value) {
      localMeasurements.value = { ...measurements.value };
    }
  } catch (error) {
    console.error("Ошибка загрузки мерок:", error);
  }
};

// Загрузка данных
onMounted(async () => {
  try {
    await store.dispatch("orders/fetchOrderDetails", orderId);
    await fetchMeasurements();
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
});

// Геттеры
const order = computed(() => store.getters["orders/currentOrder"]);
const services = computed(() => store.getters["orders/orderServices"]);
const materials = computed(() => store.getters["orders/orderMaterials"]);
const measurements = computed(() => store.getters["orders/measurements"]);
const isLoading = computed(() => store.getters["orders/isLoading"]);
const error = computed(() => store.getters["orders/error"]);

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ru-RU");
};

// Работа с мерками
const editMeasurements = () => {
  localMeasurements.value = measurements.value
    ? { ...measurements.value }
    : {
        size: "",
        chest_size: null,
        waist_size: null,
        hip_size: null,
        shoulders_width: null,
        height: null,
      };
  showMeasurementsForm.value = true;
};

const cancelMeasurementsEdit = () => {
  showMeasurementsForm.value = false;
};

const saveMeasurements = async () => {
  try {
    // Валидация
    if (
      !localMeasurements.value.size &&
      !localMeasurements.value.chest_size &&
      !localMeasurements.value.waist_size &&
      !localMeasurements.value.hip_size &&
      !localMeasurements.value.shoulders_width &&
      !localMeasurements.value.height
    ) {
      throw new Error("Заполните хотя бы одно поле");
    }

    // Подготовка данных
    const measurementsData = {
      size: localMeasurements.value.size || null,
      chest_size: localMeasurements.value.chest_size
        ? Number(localMeasurements.value.chest_size)
        : null,
      waist_size: localMeasurements.value.waist_size
        ? Number(localMeasurements.value.waist_size)
        : null,
      hip_size: localMeasurements.value.hip_size
        ? Number(localMeasurements.value.hip_size)
        : null,
      shoulders_width: localMeasurements.value.shoulders_width
        ? Number(localMeasurements.value.shoulders_width)
        : null,
      height: localMeasurements.value.height
        ? Number(localMeasurements.value.height)
        : null,
    };

    // Отправка на сервер
    await store.dispatch("orders/saveMeasurements", {
      orderId: orderId,
      measurements: measurementsData,
    });

    // Обновление данных
    await store.dispatch("orders/fetchMeasurements", orderId);
    showMeasurementsForm.value = false;

    alert("Мерки успешно сохранены!");
  } catch (error) {
    console.error("Ошибка сохранения мерок:", error);
    alert(error.message || "Не удалось сохранить мерки");
  }
};

// Остальные методы (удаление услуг, материалов и т.д.)
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

.status.новый {
  background: #e3f2fd;
  color: #1976d2;
}

.status.в-работе {
  background: #fff8e1;
  color: #ff8f00;
}

.status.готов {
  background: #e8f5e9;
  color: #388e3c;
}

.status.выполнен {
  background: #e8f5e9;
  color: #388e3c;
}

.status.отменен {
  background: #ffebee;
  color: #d32f2f;
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

.value {
  color: #333;
}

.items .item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  display: grid;
  gap: 5px;
  flex-grow: 1;
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

/* Стили для мерок */
.measurements-form {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.measurements-view {
  margin-top: 15px;
}

.measurements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.measurement-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.measurement-item .label {
  font-weight: 500;
}

.measurement-item .value {
  font-weight: bold;
}

/* Кнопки */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
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

.btn.outline {
  background: transparent;
  border: 1px solid #1976d2;
  color: #1976d2;
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
