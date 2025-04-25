<template>
  <div class="order-documents-section">
    <div class="section-header">
      <h3>Прикрепленные документы</h3>
      <button
        v-if="canEdit"
        @click="showUploadForm = !showUploadForm"
        class="btn primary"
      >
        {{ showUploadForm ? "Отмена" : "Добавить документы" }}
      </button>
    </div>

    <div v-if="showUploadForm && canEdit" class="upload-form">
      <select v-model="documentType" class="input">
        <option value="Договор">Договор</option>
        <option value="Акт">Акт</option>
        <option value="Чек">Чек</option>
      </select>

      <input
        type="file"
        multiple
        ref="fileInput"
        @change="handleFileSelect"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        class="input"
      />

      <button
        @click="uploadDocuments"
        :disabled="!selectedFiles.length"
        class="btn primary"
      >
        Загрузить выбранные файлы
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="documents-list">
      <div
        v-for="doc in documents"
        :key="doc.document_id"
        class="document-item"
      >
        <div class="document-info">
          <span class="document-type">{{ doc.document_type }}</span>
          <button
            @click="downloadDocument(doc.document_id)"
            class="document-name"
          >
            {{ doc.document_name }}
          </button>
          <span class="upload-info">
            {{ formatDate(doc.uploaded_at) }} ({{ doc.uploaded_by }})
          </span>
        </div>

        <button
          v-if="canEdit"
          @click="deleteDocument(doc.document_id)"
          class="btn danger"
        >
          Удалить
        </button>
      </div>

      <div v-if="!documents.length" class="empty-state">
        Нет прикрепленных документов
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();
const documents = ref([]);
const error = ref(null);
const showUploadForm = ref(false);
const documentType = ref("Договор");
const selectedFiles = ref([]);
const fileInput = ref(null);

const fetchDocuments = async () => {
  try {
    const response = await store.dispatch(
      "orderDetails/fetchOrderDocuments",
      props.orderId
    );
    documents.value = response.data;
  } catch (err) {
    error.value = "Ошибка загрузки документов";
  }
};

const handleFileSelect = (e) => {
  selectedFiles.value = Array.from(e.target.files);
};

const uploadDocuments = async () => {
  if (!selectedFiles.value.length) return;

  try {
    await store.dispatch("orderDetails/uploadOrderDocuments", {
      orderId: props.orderId,
      files: selectedFiles.value,
      type: documentType.value,
    });

    await fetchDocuments();
    showUploadForm.value = false;
    fileInput.value.value = "";
    selectedFiles.value = [];
  } catch (err) {
    error.value = "Ошибка загрузки файлов";
  }
};

const downloadDocument = async (documentId) => {
  try {
    await store.dispatch("orderDetails/downloadOrderDocument", documentId);
  } catch (err) {
    error.value = "Ошибка скачивания файла";
    console.error("Download error details:", err);
  }
};

const deleteDocument = async (documentId) => {
  if (!confirm("Вы уверены, что хотите удалить этот документ?")) return;

  try {
    await store.dispatch("orderDetails/deleteOrderDocument", documentId);
    await fetchDocuments();
  } catch (err) {
    error.value = "Ошибка удаления документа";
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ru-RU");
};

fetchDocuments();
</script>

<style scoped>
.order-documents-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.upload-form {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 6px;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-type {
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
}

.document-name {
  background: none;
  border: none;
  color: var(--dark-teal);
  text-decoration: underline;
  cursor: pointer;
}

.document-name:hover {
  color: #244a4b;
}

.upload-info {
  color: #666;
  font-size: 0.8rem;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.error-message {
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
