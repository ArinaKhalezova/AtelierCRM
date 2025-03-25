<template>
  <div class="actions">
    <button @click="$emit('edit')" class="btn primary">
      Редактировать заказ
    </button>
    <button @click="confirmDelete" class="btn danger">
      Удалить заказ
    </button>
  </div>
</template>

<script setup>
defineProps({
  orderId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const confirmDelete = () => {
  if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
    emit('delete');
  }
};
</script>

<style scoped>
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
  font-size: 14px;
}

.btn.primary {
  background: #1976d2;
  color: white;
}

.btn.danger {
  background: #d32f2f;
  color: white;
}
</style>