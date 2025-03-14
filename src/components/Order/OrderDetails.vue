<template>
  <div class="order-details">
    <button @click="goBack" class="back-button">← Назад</button>
    <div v-if="order">
      <div v-if="!isEditing">
        <h2>Детали заказа #{{ order.id }}</h2>
        <p><strong>ФИО клиента:</strong> {{ order.clientName }}</p>
        <p>
          <strong>Дата приема:</strong> {{ formattedDate(order.receptionDate) }}
        </p>
        <p>
          <strong>Срок выполнения:</strong>
          {{ formattedDate(order.completionDate) }}
        </p>
        <p><strong>Стоимость:</strong> {{ order.cost }} руб.</p>
        <p><strong>Статус:</strong> {{ order.status }}</p>

        <div class="action-buttons">
          <button @click="startEditing" class="edit-button">
            Редактировать
          </button>
          <button @click="deleteOrder" class="delete-button">
            Удалить заказ
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="saveChanges">
        <div class="form-group">
          <label>ФИО клиента:</label>
          <input v-model="editedOrder.clientName" required />
        </div>

        <div class="form-group">
          <label>Дата приема:</label>
          <input type="date" v-model="editedOrder.receptionDate" required />
        </div>

        <div class="form-group">
          <label>Срок выполнения:</label>
          <input type="date" v-model="editedOrder.completionDate" required />
        </div>

        <div class="form-group">
          <label>Стоимость:</label>
          <input type="number" v-model="editedOrder.cost" required />
        </div>

        <div class="form-group">
          <label>Статус:</label>
          <select v-model="editedOrder.status" required>
            <option value="взять в работу">Взять в работу</option>
            <option value="в процессе">В процессе</option>
            <option value="готово">Готово</option>
          </select>
        </div>

        <div class="action-buttons">
          <button type="submit" class="save-button">Сохранить</button>
          <button type="button" @click="cancelEditing" class="cancel-button">
            Отмена
          </button>
        </div>
      </form>
    </div>
    <div v-else>
      <p>Заказ не найден</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      isEditing: false,
      editedOrder: null,
    };
  },
  computed: {
    ...mapGetters(["getOrderById"]),
    order() {
      return this.getOrderById(this.$route.params.id);
    },
  },
  methods: {
    ...mapActions(["updateOrderAction", "deleteOrderAction"]),

    goBack() {
      this.$router.push("/orders");
    },

    formattedDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    startEditing() {
      this.editedOrder = { ...this.order };
      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
      this.editedOrder = null;
    },

    saveChanges() {
      this.updateOrderAction(this.editedOrder);
      this.isEditing = false;
    },

    deleteOrder() {
      if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
        this.deleteOrderAction(this.order.id);
        this.$router.push("/orders");
      }
    },
  },
};
</script>

<style scoped>
.order-details {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.back-button:hover {
  background-color: var(--primary-color);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button {
  background-color: #4caf50;
  color: white;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.save-button {
  background-color: #2196f3;
  color: white;
}

.cancel-button {
  background-color: #9e9e9e;
  color: white;
}

button:hover {
  opacity: 0.9;
}
</style>
