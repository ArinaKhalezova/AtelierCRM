<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Редактирование заказа #{{ order.order_id }}</h2>

      <div class="tabs">
        <button
          @click="currentTab = 'main'"
          :class="{ active: currentTab === 'main' }"
        >
          Основное
        </button>
        <button
          @click="currentTab = 'services'"
          :class="{ active: currentTab === 'services' }"
        >
          Услуги ({{ orderServices.length }})
        </button>
        <button
          @click="currentTab = 'materials'"
          :class="{ active: currentTab === 'materials' }"
        >
          Материалы ({{ orderMaterials.length }})
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-show="currentTab === 'main'" class="form-section">
          <h3>Основная информация</h3>

          <div class="form-group">
            <label>Дата создания:</label>
            <input
              type="date"
              :value="formatDateForInput(formData.created_at)"
              disabled
              class="input-disabled"
            />
          </div>

          <div class="form-group">
            <label>Срок выполнения:</label>
            <input
              type="date"
              v-model="formData.deadline_date"
              required
              :min="minDeadlineDate"
              class="input"
              :disabled="!isAdmin"
            />
          </div>

          <div class="form-section">
            <h3>Комментарий</h3>
            <textarea
              v-model="formData.comment"
              rows="4"
              class="textarea"
              placeholder="Введите комментарий..."
            ></textarea>
          </div>
        </div>

        <!-- Редактирование услуг -->
        <div v-show="currentTab === 'services'" class="form-section">
          <div class="services-list">
            <div
              v-for="service in orderServices"
              :key="service.order_service_id"
              class="service-item"
            >
              <div class="service-info">
                <span>{{ service.service_name }}</span>
                <input
                  type="number"
                  v-model.number="service.quantity"
                  min="1"
                  class="quantity-input"
                />
              </div>
              <button
                type="button"
                @click="removeService(service.order_service_id)"
                class="btn danger small"
              >
                Удалить
              </button>
            </div>

            <div class="add-service">
              <select v-model="newService.service_id">
                <option value="">Выберите услугу</option>
                <option
                  v-for="service in availableServices"
                  :key="service.service_id"
                  :value="service.service_id"
                >
                  {{ service.name }} ({{ service.base_cost }} ₽)
                </option>
              </select>
              <input
                type="number"
                v-model.number="newService.quantity"
                min="1"
                placeholder="Количество"
              />
              <button
                type="button"
                @click="addService"
                class="btn primary small"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>

        <!-- Редактирование материалов -->
        <div v-show="currentTab === 'materials'" class="form-section">
          <div class="materials-list">
            <div
              v-for="material in orderMaterials"
              :key="material.order_material_id"
              class="material-item"
            >
              <div class="material-info">
                <span>{{ material.material_name }}</span>
                <div class="quantity-controls">
                  <input
                    type="number"
                    v-model.number="material.quantity"
                    :min="1"
                    :max="material.available + material.quantity"
                    class="quantity-input"
                  />
                  <span class="available">
                    Доступно: {{ material.available + material.quantity }}
                    {{ material.unit }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                @click="removeMaterial(material.order_material_id)"
                class="btn danger small"
              >
                Удалить
              </button>
            </div>

            <div class="add-material">
              <select v-model="newMaterial.material_id">
                <option value="">Выберите материал</option>
                <option
                  v-for="material in availableMaterials"
                  :key="material.material_id"
                  :value="material.material_id"
                >
                  {{ material.material_name }} ({{
                    material.cost_per_unit
                  }}
                  ₽/{{ material.unit }})
                </option>
              </select>
              <input
                type="number"
                v-model.number="newMaterial.quantity"
                min="1"
                placeholder="Количество"
              />
              <button
                type="button"
                @click="addMaterial"
                class="btn primary small"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn secondary">
            Отмена
          </button>
          <button type="submit" class="btn primary" :disabled="isSubmitting">
            {{ isSubmitting ? "Сохранение..." : "Сохранить" }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  isOpen: Boolean,
  order: Object,
});

const emit = defineEmits(["close", "success"]);

const store = useStore();

const isAdmin = computed(() => store.getters["auth/isAdmin"]);
const formData = ref(initializeFormData());
const isSubmitting = ref(false);
const error = ref(null);

const currentTab = ref("main");
const orderServices = ref([]);
const orderMaterials = ref([]);
const availableServices = ref([]);
const availableMaterials = ref([]);

const newService = ref({
  service_id: null,
  quantity: 1,
});

const newMaterial = ref({
  material_id: null,
  quantity: 1,
});

function initializeFormData() {
  if (!props.order) return { comment: "" };

  return {
    deadline_date: formatDateForInput(props.order.deadline_date),
    comment: props.order.comment || "",
    created_at: props.order.created_at,
  };
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split("T")[0];
}

const minDeadlineDate = computed(() => {
  return formatDateForInput(formData.value.created_at);
});

watch(
  () => props.order,
  (newOrder) => {
    formData.value = initializeFormData();
  },
  { deep: true }
);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await loadServices();
      await loadMaterials();
      orderServices.value = [...props.order.services];
      orderMaterials.value = props.order.materials.map((m) => ({
        ...m,
        available: m.quantity,
      }));
    }
  }
);

const closeModal = () => {
  error.value = null;
  emit("close");
};

const validateDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!formData.value.deadline_date) {
    error.value = "Дата завершения обязательна";
    return false;
  }

  const deadline = new Date(formData.value.deadline_date);
  deadline.setHours(0, 0, 0, 0);

  const created = new Date(formData.value.created_at);
  created.setHours(0, 0, 0, 0);

  if (deadline < created) {
    error.value = "Дата завершения не может быть раньше даты создания";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateDates()) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    const orderData = {
      deadline_date: formData.value.deadline_date,
      comment: formData.value.comment.trim(),
    };

    const success = await store.dispatch("orders/editOrder", {
      orderId: props.order.order_id,
      orderData,
    });

    if (success) {
      emit("success");
      closeModal();
    }
  } catch (err) {
    error.value =
      err.response?.data?.error || err.message || "Ошибка при сохранении";
  } finally {
    isSubmitting.value = false;
  }
};

async function loadServices() {
  const response = await store.dispatch("services/fetchServices");
  availableServices.value = response.data;
}

async function loadMaterials() {
  const response = await store.dispatch("materials/fetchMaterials");
  availableMaterials.value = response.data;
}

async function updateServiceQuantity(serviceId, quantity) {
  await store.dispatch("orderDetails/updateOrderService", {
    orderId: props.order.order_id,
    serviceId,
    quantity,
  });
}

async function updateMaterialQuantity(materialId, quantity) {
  await store.dispatch("orderDetails/updateOrderMaterial", {
    orderId: props.order.order_id,
    materialId,
    quantity,
  });
}

async function addService() {
  if (!newService.value.service_id || newService.value.quantity < 1) return;

  await store.dispatch("orderDetails/addServiceToOrder", {
    orderId: props.order.order_id,
    service: newService.value,
  });

  newService.value = { service_id: null, quantity: 1 };
  await loadServices();
}

async function addMaterial() {
  if (!newMaterial.value.material_id || newMaterial.value.quantity < 1) return;

  await store.dispatch("orderDetails/addMaterialToOrder", {
    orderId: props.order.order_id,
    material: newMaterial.value,
  });

  newMaterial.value = { material_id: null, quantity: 1 };
  await loadMaterials();
}

async function removeService(serviceId) {
  await store.dispatch("orderDetails/removeServiceFromOrder", {
    orderId: props.order.order_id,
    serviceId,
  });
  orderServices.value = orderServices.value.filter(
    (s) => s.order_service_id !== serviceId
  );
}

async function removeMaterial(materialId) {
  await store.dispatch("orderDetails/removeMaterialFromOrder", {
    orderId: props.order.order_id,
    materialId,
  });
  orderMaterials.value = orderMaterials.value.filter(
    (m) => m.order_material_id !== materialId
  );
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  border-color: var(--teal);
}

.service-item,
.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  margin-left: 1rem;
}

.add-service,
.add-material {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(32, 201, 151, 0.2);
}

.input-disabled {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.fitting-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  position: relative;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: var(--teal);
  color: white;
}

.btn.primary:hover {
  background-color: var(--dark-teal);
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}

.btn.danger {
  background-color: #fff0f0;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}

.btn.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-message {
  color: var(--danger);
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff0f0;
  border-radius: 6px;
  text-align: center;
}

.comment-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #ddd;
}

.comment-part {
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.fitting-part {
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 4px;
  margin-top: 1rem;
}

.fitting-header {
  font-weight: 500;
  color: var(--teal);
  margin-bottom: 0.5rem;
}

.fitting-content {
  white-space: pre-wrap;
  color: #444;
}
</style>
