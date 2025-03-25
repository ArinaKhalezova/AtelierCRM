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
    required: true
  }
});
</script>

<style scoped>
.section {
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre-line;
}
</style>