<template>
  <div class="section" v-if="comment && comment.trim()">
    <h3>Комментарии</h3>
    <div class="comment">
      <template v-for="(part, index) in formattedComment" :key="index">
        <div v-if="part.type === 'text'">{{ part.content }}</div>
        <div v-else class="fitting">
          <div class="fitting-header">{{ part.header }}</div>
          <div class="fitting-content">{{ part.content }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<!-- Комментарий клиента о пожеланиях

--- Примерки ---

Примерка #1 (2023-05-10):
Клиенту нужно укоротить рукава на 2 см

Примерка #2 (2023-05-15):
Все устраивает, можно сдавать работу -->

<script setup>
import { computed } from "vue";

const props = defineProps({
  comment: {
    type: String,
    default: "",
  },
});

const formattedComment = computed(() => {
  if (!props.comment) return [];

  const parts = [];
  const commentText = props.comment.split("--- Примерки ---");

  if (commentText[0].trim()) {
    parts.push({
      type: "text",
      content: commentText[0].trim(),
    });
  }

  if (commentText[1]) {
    const fittings = commentText[1].split("Примерка #");
    fittings.slice(1).forEach((fitting) => {
      const [header, ...contentParts] = fitting.split(":");
      parts.push({
        type: "fitting",
        header: `Примерка ${header.trim()}`,
        content: contentParts.join(":").trim(),
      });
    });
  }

  return parts;
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
  display: flex;
  align-items: center;
}

.section h3::before {
  margin-right: 0.5rem;
  font-size: 1.1em;
}

.comment {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  font-size: 0.95rem;
}

.fitting {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.fitting:hover {
  background: #f0f3f5;
}

.fitting-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--teal);
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.fitting-header::before {
  content: "📅";
  margin-right: 0.5rem;
  font-size: 1em;
}

.fitting-content {
  white-space: pre-wrap;
  padding: 0.5rem 0 0 0;
  color: #555;
  line-height: 1.5;
}

/* Добавляем разделитель между частями комментария */
.fitting + .fitting {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e0e0e0;
}

/* Стиль для обычного текста комментария */
.comment > div:first-child {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}
</style>
