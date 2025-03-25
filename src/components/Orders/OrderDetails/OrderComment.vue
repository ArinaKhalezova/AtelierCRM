<template>
  <div class="section">
    <h3>Комментарий</h3>
    <div class="comment">{{ comment }}</div>
  </div>
</template>

<script setup>
defineProps({
  comment: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark-teal);
  font-size: 1.2rem;
}

.comment {
  padding: 1.25rem;
  background-color: white;
  border: 1px solid rgba(77, 72, 71, 0.1);
  border-radius: var(--border-radius);
  white-space: pre-line;
  color: var(--dark-teal);
  line-height: 1.6;
  font-size: 0.95rem;
}
</style>
