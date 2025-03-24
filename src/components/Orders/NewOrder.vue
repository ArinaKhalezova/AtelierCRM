<template>
  <div class="new-order">
    <h2>Создание нового заказа</h2>

    <div class="form">
      <div class="section">
        <h3>Клиент</h3>
        <select v-model="order.client_id" required class="input">
          <option value="" disabled>Выберите клиента</option>
          <option
            v-for="client in clients"
            :key="client.client_id"
            :value="client.client_id"
          >
            {{ client.fullname }} ({{ client.phone }})
          </option>
        </select>
      </div>

      <div class="section">
        <h3>Услуги</h3>
        <div class="services">
          <div
            v-for="service in availableServices"
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
              {{ service.name }} ({{ service.base_cost }} ₽)
            </label>
            <input
              type="number"
              v-model.number="serviceQuantities[service.service_id]"
              min="1"
              @input="calculateTotal"
              :disabled="!selectedServices.includes(service.service_id)"
              class="quantity"
            />
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Материалы</h3>
        <div class="materials">
          <div
            v-for="material in availableMaterials"
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
              {{ material.material_name }} ({{ material.cost_per_unit }} ₽ /
              {{ material.unit }})
            </label>
            <input
              type="number"
              v-model.number="materialQuantities[material.material_id]"
              min="1"
              :max="material.quantity"
              @input="calculateTotal"
              :disabled="!selectedMaterials.includes(material.material_id)"
              class="quantity"
            />
            <span class="available">
              Доступно: {{ material.quantity }} {{ material.unit }}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Информация о заказе</h3>
        <div class="row">
          <div class="group">
            <label>Дата примерки</label>
            <input type="date" v-model="order.fitting_date" class="input" />
          </div>
          <div class="group">
            <label>Срок выполнения *</label>
            <input
              type="date"
              v-model="order.deadline_date"
              required
              class="input"
              :min="minDeadlineDate"
            />
          </div>
        </div>
        <div class="group">
          <label>Комментарий</label>
          <textarea v-model="order.comment" class="textarea"></textarea>
        </div>
      </div>

      <div class="total">
        <h3>Итоговая стоимость: {{ order.total_cost }} ₽</h3>
      </div>

      <div class="actions">
        <button @click="createOrder" :disabled="!isValid" class="btn primary">
          Создать заказ
        </button>
        <button @click="cancel" class="btn">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
});

const selectedServices = ref([]);
const selectedMaterials = ref([]);
const serviceQuantities = ref({});
const materialQuantities = ref({});

onMounted(async () => {
  await store.dispatch("clients/fetchClients");
  await store.dispatch("services/fetchServices");
  await store.dispatch("materials/fetchMaterials");
});

const clients = computed(() => store.state.clients.clients);
const availableServices = computed(() => store.state.services.services);
const availableMaterials = computed(() => store.state.materials.materials);

const minDeadlineDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
});

const isValid = computed(() => {
  return (
    order.value.client_id &&
    order.value.deadline_date &&
    (selectedServices.value.length > 0 || selectedMaterials.value.length > 0)
  );
});

const calculateTotal = () => {
  let total = 0;

  // Считаем услуги
  selectedServices.value.forEach((serviceId) => {
    const service = availableServices.value.find(
      (s) => s.service_id === serviceId
    );
    const quantity = serviceQuantities.value[serviceId] || 1;
    total += service.base_cost * quantity;
  });

  // Считаем материалы
  selectedMaterials.value.forEach((materialId) => {
    const material = availableMaterials.value.find(
      (m) => m.material_id === materialId
    );
    const quantity = materialQuantities.value[materialId] || 1;
    total += material.cost_per_unit * quantity;
  });

  order.value.total_cost = total;
};

const createOrder = async () => {
  try {
    // Создаем заказ
    const createdOrder = await store.dispatch(
      "orders/createOrder",
      order.value
    );

    // Добавляем услуги
    await Promise.all(
      selectedServices.value.map((serviceId) => {
        return store.dispatch("orders/addServiceToOrder", {
          orderId: createdOrder.order_id,
          service: {
            service_id: serviceId,
            quantity: serviceQuantities.value[serviceId] || 1,
          },
        });
      })
    );

    // Добавляем материалы
    await Promise.all(
      selectedMaterials.value.map((materialId) => {
        return store.dispatch("orders/addMaterialToOrder", {
          orderId: createdOrder.order_id,
          material: {
            material_id: materialId,
            quantity: materialQuantities.value[materialId] || 1,
          },
        });
      })
    );

    router.push(`/orders/${createdOrder.order_id}`);
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    alert("Не удалось создать заказ");
  }
};

const cancel = () => {
  router.push("/orders");
};
</script>

<style scoped>
.new-order {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 25px;
}

.row {
  display: flex;
  gap: 15px;
}

.group {
  flex: 1;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input,
.textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.services,
.materials {
  display: grid;
  gap: 10px;
}

.service,
.material {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.quantity {
  width: 60px;
  padding: 5px;
  text-align: center;
}

.available {
  font-size: 0.9em;
  color: #666;
}

.total {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background: #1976d2;
  color: white;
}

.btn.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
