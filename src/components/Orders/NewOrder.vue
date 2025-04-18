<template>
  <div class="new-order">
    <h2>Создание нового заказа</h2>

    <div class="form">
      <div class="section">
        <h3>Клиент</h3>
        <div class="search-box">
          <input
            v-model="clientSearch"
            placeholder="Поиск клиента..."
            class="search-input"
          />
        </div>
        <select
          v-model="order.client_id"
          required
          class="input"
          :class="{ 'input-error': !order.client_id }"
        >
          <option value="" disabled>Выберите клиента</option>
          <option
            v-for="client in filteredClients"
            :key="client.client_id"
            :value="client.client_id"
          >
            {{ client.fullname }} ({{ client.phone_number }})
          </option>
        </select>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>Услуги</h3>
          <button
            type="button"
            @click="toggleServicesVisibility"
            class="toggle-btn"
          >
            {{ showServices ? "Скрыть" : "Показать" }}
          </button>
        </div>
        <div class="search-box">
          <input
            v-model="serviceSearch"
            placeholder="Поиск услуг..."
            class="search-input"
          />
        </div>
        <div v-if="showServices" class="services">
          <div
            v-for="service in filteredServices"
            :key="service.service_id"
            class="service"
          >
            <label>
              <input
                type="checkbox"
                v-model="selectedServices"
                :value="service.service_id"
                @change="calculateTotal"
              />
              <span class="service-info">
                <span class="service-name">{{ service.name }}</span>
                <span class="service-category">{{ service.category }}</span>
                <span class="service-price">{{ service.base_cost }} ₽</span>
              </span>
            </label>
            <input
              type="number"
              v-model.number="serviceQuantities[service.service_id]"
              min="1"
              @input="calculateTotal"
              :disabled="!selectedServices.includes(service.service_id)"
              class="quantity"
              title="Количество"
            />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>Материалы</h3>
          <button
            type="button"
            @click="toggleMaterialsVisibility"
            class="toggle-btn"
          >
            {{ showMaterials ? "Скрыть" : "Показать" }}
          </button>
        </div>
        <div class="search-box">
          <input
            v-model="materialSearch"
            placeholder="Поиск материалов..."
            class="search-input"
          />
        </div>
        <div v-if="showMaterials" class="materials">
          <div
            v-for="material in filteredMaterials"
            :key="material.material_id"
            class="material"
          >
            <label>
              <input
                type="checkbox"
                v-model="selectedMaterials"
                :value="material.material_id"
                @change="calculateTotal"
              />
              <span class="material-info">
                <span class="material-name">{{ material.material_name }}</span>
                <span class="material-unit"
                  >{{ material.cost_per_unit }} ₽ / {{ material.unit }}</span
                >
              </span>
            </label>
            <div class="material-controls">
              <input
                type="number"
                v-model.number="materialQuantities[material.material_id]"
                min="1"
                :max="material.quantity"
                @input="calculateTotal"
                :disabled="!selectedMaterials.includes(material.material_id)"
                class="quantity"
                :class="{
                  error:
                    materialQuantities[material.material_id] >
                    material.quantity,
                }"
              />
              <span class="available">
                Доступно: {{ material.quantity }} {{ material.unit }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Информация о заказе</h3>
        <div class="row">
          <div class="group">
            <label>Дата примерки (необязательно)</label>
            <input
              type="date"
              v-model="order.fitting_date"
              class="input"
              :min="new Date().toISOString().split('T')[0]"
            />
            <span v-if="errors.fitting_date" class="error-message">
              {{ errors.fitting_date }}
            </span>
          </div>
          <div class="group">
            <label>Срок выполнения *</label>
            <input
              type="date"
              v-model="order.deadline_date"
              required
              class="input"
              :class="{ 'input-error': errors.deadline_date }"
              :min="minDeadlineDate"
            />
            <span v-if="errors.deadline_date" class="error-message">
              {{ errors.deadline_date }}
            </span>
          </div>
        </div>
        <div class="group">
          <label>Комментарий (необязательно)</label>
          <textarea v-model="order.comment" class="textarea"></textarea>
        </div>
      </div>

      <div class="total-section">
        <div class="total-details">
          <div class="total-item" v-if="selectedServices.length > 0">
            <span>Услуги ({{ selectedServices.length }})</span>
            <span>{{ servicesCost }} ₽</span>
          </div>
          <div class="total-item" v-if="selectedMaterials.length > 0">
            <span>Материалы ({{ selectedMaterials.length }})</span>
            <span>{{ materialsCost }} ₽</span>
          </div>
        </div>
        <div class="total-amount">
          <h3>Итоговая стоимость: {{ order.total_cost }} ₽</h3>
        </div>
      </div>

      <div class="actions">
        <button @click="createOrder" :disabled="!isValid" class="btn primary">
          Создать заказ
        </button>
        <button @click="cancel" class="btn secondary">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const order = ref({
  client_id: "",
  fitting_date: "",
  deadline_date: "",
  comment: "",
  status: "Новый",
  total_cost: 0,
  created_at: new Date().toISOString().split("T")[0],
});

const errors = ref({
  deadline_date: "",
  fitting_date: "",
});

// Поиск и фильтрация
const clientSearch = ref("");
const serviceSearch = ref("");
const materialSearch = ref("");
const showServices = ref(true);
const showMaterials = ref(true);

const selectedServices = ref([]);
const selectedMaterials = ref([]);
const serviceQuantities = ref({});
const materialQuantities = ref({});

const initializeQuantities = () => {
  availableServices.value.forEach((service) => {
    serviceQuantities.value[service.service_id] = 1;
  });
  availableMaterials.value.forEach((material) => {
    materialQuantities.value[material.material_id] = 1;
  });
};

onMounted(async () => {
  await store.dispatch("clients/fetchClients");
  await store.dispatch("services/fetchServices");
  await store.dispatch("materials/fetchMaterials");
  initializeQuantities();
});

const clients = computed(() => store.state.clients.clients);
const availableServices = computed(() => store.state.services.services);
const availableMaterials = computed(() => store.state.materials.materials);

// Фильтрация клиентов
const filteredClients = computed(() => {
  if (!clientSearch.value) return clients.value;
  const query = clientSearch.value.toLowerCase();
  return clients.value.filter(
    (client) =>
      client.fullname.toLowerCase().includes(query) ||
      client.phone_number.toLowerCase().includes(query)
  );
});

// Фильтрация услуг
const filteredServices = computed(() => {
  if (!serviceSearch.value) return availableServices.value;
  const query = serviceSearch.value.toLowerCase();
  return availableServices.value.filter(
    (service) =>
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.base_cost.toString().includes(query)
  );
});

// Фильтрация материалов
const filteredMaterials = computed(() => {
  if (!materialSearch.value) return availableMaterials.value;
  const query = materialSearch.value.toLowerCase();
  return availableMaterials.value.filter(
    (material) =>
      material.material_name.toLowerCase().includes(query) ||
      material.unit.toLowerCase().includes(query) ||
      material.cost_per_unit.toString().includes(query)
  );
});

const minDeadlineDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
});

const isValid = computed(() => {
  const hasServicesOrMaterials =
    selectedServices.value.length > 0 || selectedMaterials.value.length > 0;
  const hasNoDateErrors =
    !errors.value.deadline_date && !errors.value.fitting_date;

  return (
    order.value.client_id &&
    order.value.deadline_date &&
    hasServicesOrMaterials &&
    hasNoDateErrors
  );
});

// Стоимость услуг и материалов отдельно
const servicesCost = computed(() => {
  return selectedServices.value.reduce((total, serviceId) => {
    const service = availableServices.value.find(
      (s) => s.service_id === serviceId
    );
    const quantity = serviceQuantities.value[serviceId] || 1;
    return total + service.base_cost * quantity;
  }, 0);
});

const materialsCost = computed(() => {
  return selectedMaterials.value.reduce((total, materialId) => {
    const material = availableMaterials.value.find(
      (m) => m.material_id === materialId
    );
    let quantity = materialQuantities.value[materialId] || 1;
    if (quantity > material.quantity) quantity = material.quantity;
    return total + material.cost_per_unit * quantity;
  }, 0);
});

const toggleServicesVisibility = () => {
  showServices.value = !showServices.value;
};

const toggleMaterialsVisibility = () => {
  showMaterials.value = !showMaterials.value;
};

// Функция валидации дат
const validateDates = () => {
  errors.value.deadline_date = "";
  errors.value.fitting_date = "";

  if (!order.value.deadline_date) {
    errors.value.deadline_date = "Срок выполнения обязателен";
    return;
  }

  if (order.value.fitting_date && order.value.deadline_date) {
    const fittingDate = new Date(order.value.fitting_date);
    const deadlineDate = new Date(order.value.deadline_date);

    if (deadlineDate < fittingDate) {
      errors.value.deadline_date =
        "Срок выполнения не может быть раньше примерки";
    }
  }

  // Проверка что срок выполнения не раньше сегодняшнего дня
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(order.value.deadline_date);

  if (deadlineDate < today) {
    errors.value.deadline_date = "Срок выполнения не может быть в прошлом";
  }
};

watch(
  () => [order.value.fitting_date, order.value.deadline_date],
  () => {
    validateDates();
    calculateTotal();
  },
  { deep: true }
);

const calculateTotal = () => {
  order.value.total_cost = servicesCost.value + materialsCost.value;
};

const createOrder = async () => {
  try {
    // Подготовка данных заказа
    const orderData = {
      client_id: order.value.client_id,
      fitting_date: order.value.fitting_date || null,
      deadline_date: order.value.deadline_date,
      comment: order.value.comment || null,
      total_cost: order.value.total_cost,
      status: "Новый",
    };

    // 1. Создаем заказ
    const createdOrder = await store.dispatch("orders/createOrder", orderData);

    // 2. Добавляем услуги и материалы
    const promises = [];

    if (selectedServices.value.length > 0) {
      selectedServices.value.forEach((serviceId) => {
        promises.push(
          store.dispatch("orderDetails/addServiceToOrder", {
            orderId: createdOrder.order_id,
            service: {
              service_id: serviceId,
              quantity: serviceQuantities.value[serviceId] || 1,
            },
          })
        );
      });
    }

    if (selectedMaterials.value.length > 0) {
      selectedMaterials.value.forEach((materialId) => {
        promises.push(
          store.dispatch("orderDetails/addMaterialToOrder", {
            orderId: createdOrder.order_id,
            material: {
              material_id: materialId,
              quantity: materialQuantities.value[materialId] || 1,
            },
          })
        );
      });
    }

    await Promise.all(promises);

    // 3. Переходим на страницу заказа
    router.push(`/orders/${createdOrder.order_id}`);
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    let errorMessage = "Не удалось создать заказ";

    if (error.response?.data?.details) {
      errorMessage += `: ${error.response.data.details}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    alert(errorMessage);
  }
};

const cancel = () => {
  router.push("/orders");
};
</script>

<style scoped>
.error-message {
  display: block;
  margin-top: 0.5rem;
  color: var(--danger);
  font-size: 0.85rem;
}

.input-error {
  border-color: var(--danger) !important;
}

.new-order {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: var(--dark-teal);
  margin-bottom: 2rem;
  font-size: 1.75rem;
}

.form {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(77, 72, 71, 0.1);
}

.section:last-child {
  border-bottom: none;
}

.section h3 {
  color: var(--dark-teal);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--teal);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--warm-gray);
  font-size: 0.95rem;
  font-weight: 500;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(77, 72, 71, 0.2);
  border-radius: var(--border-radius);
  background-color: white;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: var(--dark-teal);
}

.search-input:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(139, 170, 173, 0.2);
}

.input,
.textarea,
select {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(77, 72, 71, 0.2);
  border-radius: var(--border-radius);
  background-color: white;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: var(--dark-teal);
}

.input:focus,
.textarea:focus,
select:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(139, 170, 173, 0.2);
}

.textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.services,
.materials {
  display: grid;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.service {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: white;
  border: 1px solid rgba(77, 72, 71, 0.1);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.service:hover {
  border-color: rgba(139, 170, 173, 0.3);
}

.service label {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0;
  color: var(--dark-teal);
  cursor: pointer;
  flex-grow: 1;
}

.service-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.service-name {
  font-weight: 500;
}

.service-category {
  font-size: 0.85rem;
  color: var(--warm-gray);
}

.service-price {
  font-weight: 600;
  color: var(--dark-teal);
}

.service input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--teal);
  flex-shrink: 0;
}

.material {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: white;
  border: 1px solid rgba(77, 72, 71, 0.1);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.material:hover {
  border-color: rgba(139, 170, 173, 0.3);
}

.material label {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0;
  color: var(--dark-teal);
  cursor: pointer;
  flex-grow: 1;
}

.material-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.material-name {
  font-weight: 500;
}

.material-unit {
  font-size: 0.85rem;
  color: var(--warm-gray);
}

.material input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--teal);
  flex-shrink: 0;
}

.material-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity {
  width: 80px;
  padding: 0.65rem;
  text-align: center;
  border: 1px solid rgba(77, 72, 71, 0.2);
  border-radius: var(--border-radius);
  background-color: white;
  font-size: 0.95rem;
}

.quantity:disabled {
  background-color: #f9f9f9;
  opacity: 0.7;
}

.quantity.error {
  border-color: var(--danger);
}

.available {
  font-size: 0.85rem;
  color: var(--warm-gray);
  white-space: nowrap;
}

.total-section {
  margin: 2.5rem 0;
  padding: 1.5rem;
  background-color: white;
  border: 1px solid rgba(139, 170, 173, 0.3);
  border-radius: var(--border-radius);
}

.total-details {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(139, 170, 173, 0.2);
}

.total-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--warm-gray);
}

.total-item:last-child {
  margin-bottom: 0;
}

.total-amount {
  text-align: right;
}

.total-amount h3 {
  color: var(--dark-teal);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.85rem 2rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
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

.btn.primary:disabled {
  background-color: var(--warm-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.secondary {
  background-color: white;
  border: 1px solid var(--teal);
  color: var(--teal);
}

.btn.secondary:hover {
  background-color: rgba(139, 170, 173, 0.1);
}

@media (max-width: 768px) {
  .new-order {
    padding: 1.5rem;
  }

  .form {
    padding: 1.5rem;
  }

  .row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .service,
  .material {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .material-controls {
    width: 100%;
    justify-content: space-between;
  }

  .quantity {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
