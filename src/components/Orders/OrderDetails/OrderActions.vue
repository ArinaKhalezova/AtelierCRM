<template>
  <div class="actions">
    <!-- <button @click="$emit('edit')" class="btn primary">
      Редактировать заказ
    </button> -->
    <button @click="confirmDelete" class="btn danger">Удалить заказ</button>
  </div>
</template>

<script setup>
defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["edit", "delete"]);

const confirmDelete = () => {
  if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
    emit("delete");
  }
};
</script>

<style scoped>
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.85rem 1.75rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.95rem;
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

.btn.danger {
  background-color: white;
  border: 1px solid var(--danger);
  color: var(--danger);
}

.btn.danger:hover {
  background-color: var(--danger);
  color: white;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
