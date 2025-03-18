<template>
  <details class="settings-section">
    <summary class="settings_header"><h2>Способы оплаты</h2></summary>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div
      v-for="method in methods"
      :key="method.payment_method_id"
      class="settings-item"
    >
      <p><strong>Способ оплаты:</strong> {{ method.method_name }}</p>
      <button
        @click="deletePaymentMethod(method.payment_method_id)"
        class="delete-button"
      >
        Удалить
      </button>
    </div>
    <input v-model="newMethod" placeholder="Новый способ оплаты" />
    <button @click="addPaymentMethod" class="add-button">Добавить</button>
  </details>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const newMethod = ref("");
const error = ref("");

const methods = computed(() => store.state.paymentMethods.paymentMethods);

const addPaymentMethod = async () => {
  if (newMethod.value.trim()) {
    try {
      await store.dispatch("paymentMethods/addPaymentMethodAction", {
        method_name: newMethod.value,
      });
      newMethod.value = "";
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при добавлении способа оплаты";
    }
  } else {
    error.value = "Название способа оплаты не может быть пустым";
  }
};

const deletePaymentMethod = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот способ оплаты?")) {
    try {
      await store.dispatch("paymentMethods/deletePaymentMethodAction", id);
      error.value = "";
    } catch (err) {
      error.value = "Ошибка при удалении способа оплаты";
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 10px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.add-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.settings-section {
  margin-bottom: 20px;
}

.settings_header {
  display: flex;
  justify-content: center;
}

details {
  background-color: rgba(255, 255, 255, 0.71);
  border: 1px solid none;
  padding: 10px;
  border-radius: 20px;
}

summary {
  cursor: pointer;
  font-weight: bold;
}

details[open] summary {
  margin-bottom: 10px;
}
</style>
