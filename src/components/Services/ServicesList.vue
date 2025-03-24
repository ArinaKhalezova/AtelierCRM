<template>
  <div class="services-tab">
    <h2>Услуги</h2>
    <button @click="openServiceModal" class="add-service-button">
      Добавить услугу
    </button>

    <div class="service-list">
      <div
        v-for="service in services"
        :key="service.service_id"
        class="service-item"
      >
        <p><strong>Категория:</strong> {{ service.category }}</p>
        <p><strong>Название:</strong> {{ service.name }}</p>
        <p><strong>Описание:</strong> {{ service.description || "—" }}</p>
        <p><strong>Стоимость:</strong> {{ service.base_cost }} ₽</p>
        <button
          @click="deleteService(service.service_id)"
          class="delete-button"
        >
          Удалить
        </button>
      </div>
    </div>

    <Modal :isOpen="isServiceModalOpen" @close="closeServiceModal">
      <h3>Добавить новую услугу</h3>
      <form @submit.prevent="addService">
        <div class="form-group">
          <label>Категория:</label>
          <select v-model="newService.category" required>
            <option value="" disabled>Выберите категорию</option>
            <option
              v-for="category in serviceCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Название:</label>
          <input v-model="newService.name" required minlength="2" />
        </div>
        <div class="form-group">
          <label>Описание:</label>
          <textarea v-model="newService.description" />
        </div>
        <div class="form-group">
          <label>Базовая стоимость:</label>
          <input
            v-model.number="newService.base_cost"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Добавление..." : "Добавить услугу" }}
        </button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "../Modal.vue";

const store = useStore();

const isServiceModalOpen = ref(false);
const newService = ref({
  category: "",
  name: "",
  description: "",
  base_cost: 0,
});

const services = computed(() => store.state.services.services);
const serviceCategories = computed(
  () => store.state.services.serviceCategories
);
const error = computed(() => store.state.services.error);

onMounted(async () => {
  await store.dispatch("services/fetchServices");
  await store.dispatch("services/fetchServiceCategories");
  // try {
  //   await store
  //     .dispatch("services/fetchServices")
  //     .then(console.log(store.state.services.services));
  //   await store.dispatch("services/fetchServiceCategories");
  // } catch (err) {
  //   console.error("Ошибка при загрузке данных:", err);
  //   store.commit("services/SET_ERROR", "Не удалось загрузить услуги");
  // }
});

const openServiceModal = () => {
  isServiceModalOpen.value = true;
};

const closeServiceModal = () => {
  isServiceModalOpen.value = false;
  newService.value = { category: "", name: "", description: "", base_cost: 0 };
  store.commit("services/SET_ERROR", null);
};

const addService = async () => {
  try {
    const serviceData = {
      category: newService.value.category,
      name: newService.value.name.trim(),
      description: newService.value.description.trim(),
      base_cost: parseFloat(newService.value.base_cost),
    };

    await store.dispatch("services/addService", serviceData);
    closeServiceModal();
  } catch (err) {
    console.error("Ошибка при добавлении услуги:", err);
  }
};

const deleteService = async (serviceId) => {
  if (confirm("Вы уверены, что хотите удалить эту услугу?")) {
    try {
      await store.dispatch("services/deleteService", serviceId);
    } catch (err) {
      console.error("Ошибка при удалении услуги:", err);
    }
  }
};
</script>

<style scoped>
.services-tab {
  padding: 20px;
}

.add-service-button {
  background: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.service-list {
  display: grid;
  gap: 15px;
}

.service-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  position: relative;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.error-message {
  color: #ff4444;
  margin-bottom: 15px;
  padding: 10px;
  background: #ffeeee;
  border-radius: 4px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
