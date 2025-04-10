<template>
  <div class="section" v-if="comment && comment.trim()">
    <h3>Комментарий</h3>
    <div class="comment">
      {{ comment }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  comment: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.section {
  margin-top: 2rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin: 0 0 1rem 0;
  color: var(--dark-gray);
  font-size: 1.2rem;
  font-weight: 600;
}

.comment {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  font-size: 0.95rem;
}
</style>
