<template>
  <div class="history-section">
    <h3>История изменений услуг</h3>
    <div v-for="entry in history" :key="entry.history_id" class="entry">
      <div class="entry-header">
        <span>{{ entry.fullname }} ({{ entry.position }})</span>
        <span>{{ formatDate(entry.changed_at) }}</span>
      </div>
      <div class="entry-body">
        <div class="service-info">
          Услуга: <strong>{{ entry.service_name }}</strong>
        </div>
        <div class="status-change">
          Статус изменен с 
          <span class="old-status">{{ entry.old_status }}</span> на 
          <span class="new-status">{{ entry.new_status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['history']);

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};
</script>

<style scoped>
.history-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.entry {
  padding: 1rem;
  margin: 0.5rem 0;
  background: #f8f9fa;
  border-radius: 6px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.service-info {
  margin-bottom: 0.3rem;
  font-size: 0.95rem;
}

.status-change {
  font-size: 0.9rem;
}

.old-status {
  color: #dc3545;
  text-decoration: line-through;
  margin-right: 0.5rem;
}

.new-status {
  color: #28a745;
  font-weight: 500;
}
</style>