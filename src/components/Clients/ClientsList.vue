<template>
  <div class="clients-list">
    <h2>Клиенты</h2>
    <button @click="openAddModal" class="add-employee-button">
      Добавить клиента
    </button>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="client-item" v-for="client in clients" :key="client.client_id">
      <p><strong>ФИО:</strong> {{ client.fullname }}</p>
      <p><strong>Телефон:</strong> {{ client.phone_number }}</p>
      <p><strong>Email:</strong> {{ client.email || "Не указан" }}</p>
      <button @click="deleteClient(client.client_id)" class="delete-button">
        Удалить
      </button>
    </div>

    <!-- Модальное окно добавления -->
    <Modal :isOpen="isModalOpen" @close="closeModal">
      <h3>Новый клиент</h3>
      <form @submit.prevent="addClient">
        <div class="form-group">
          <label>ФИО:</label>
          <input v-model="newClient.fullname" required />
        </div>
        <div class="form-group">
          <label>Телефон:</label>
          <input v-model="newClient.phone_number" required />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input v-model="newClient.email" type="email" />
        </div>
        <button type="submit">Добавить</button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/Modal.vue";

const store = useStore();
const isModalOpen = ref(false);
const newClient = ref({
  fullname: "",
  phone_number: "",
  email: "",
});

const clients = computed(() => store.state.clients.clients);
const error = computed(() => store.state.clients.error);

onMounted(async () => {
  await store.dispatch("clients/fetchClients");
});

const openAddModal = () => (isModalOpen.value = true);
const closeModal = () => (isModalOpen.value = false);

const addClient = async () => {
  if (!newClient.value.fullname || !newClient.value.phone_number) {
    store.commit("clients/SET_ERROR", "Заполните обязательные поля");
    return;
  }

  try {
    await store.dispatch("clients/addClientAction", newClient.value);
    newClient.value = { fullname: "", phone_number: "", email: "" };
    closeModal();
  } catch (err) {
    store.commit("clients/SET_ERROR", "Ошибка при добавлении");
  }
};

const deleteClient = async (id) => {
  if (confirm("Удалить клиента?")) {
    try {
      await store.dispatch("clients/deleteClientAction", id);
    } catch (err) {
      store.commit("clients/SET_ERROR", "Ошибка при удалении");
    }
  }
};
</script>
