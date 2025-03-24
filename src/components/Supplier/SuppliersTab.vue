<template>
  <div class="suppliers-tab">
    <h2>Поставщики</h2>
    <button @click="openSupplierModal" class="add-supplier-button">
      Добавить поставщика
    </button>

    <div class="supplier-list">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div
        v-for="supplier in suppliers"
        :key="supplier.supplier_id"
        class="supplier-item"
      >
        <p><strong>Название:</strong> {{ supplier.org_name }}</p>
        <p><strong>Телефон:</strong> {{ supplier.phone_number }}</p>
        <p><strong>Адрес:</strong> {{ supplier.address }}</p>
        <p><strong>ИНН:</strong> {{ supplier.inn }}</p>
        <button
          @click="deleteSupplier(supplier.supplier_id)"
          class="delete-button"
        >
          Удалить
        </button>
      </div>
    </div>

    <!-- Модальное окно для добавления поставщика -->
    <Modal :isOpen="isSupplierModalOpen" @close="closeSupplierModal">
      <h3>Добавить нового поставщика</h3>
      <form @submit.prevent="addSupplier">
        <div class="form-group">
          <label>Название организации:</label>
          <input v-model="newSupplier.org_name" required />
        </div>
        <div class="form-group">
          <label>Телефон:</label>
          <input v-model="newSupplier.phone_number" required />
        </div>
        <div class="form-group">
          <label>Адрес:</label>
          <input v-model="newSupplier.address" required />
        </div>
        <div class="form-group">
          <label>ИНН:</label>
          <input v-model="newSupplier.inn" required />
        </div>
        <button type="submit">Добавить поставщика</button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Modal from '../Modal.vue'

const store = useStore()
const isSupplierModalOpen = ref(false)
const newSupplier = ref({
  org_name: '',
  phone_number: '',
  address: '',
  inn: ''
})

// Computed
const error = computed(() => store.state.suppliers.error)
const suppliers = computed(() => store.state.suppliers.suppliers)

// методы
const openSupplierModal = () => {
  isSupplierModalOpen.value = true
}

const closeSupplierModal = () => {
  isSupplierModalOpen.value = false
  store.commit('suppliers/SET_ERROR', null)
}

const addSupplier = async () => {
  if (Object.values(newSupplier.value).every(field => field.trim())) {
    try {
      await store.dispatch('suppliers/addSupplierAction', newSupplier.value)
      newSupplier.value = { org_name: '', phone_number: '', address: '', inn: '' }
      closeSupplierModal()
    } catch (err) {
      console.error('Add supplier error:', err)
    }
  } else {
    store.commit('suppliers/SET_ERROR', 'Все поля обязательны для заполнения')
  }
}

const deleteSupplier = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этого поставщика?')) return
  
  try {
    await store.dispatch('suppliers/deleteSupplierAction', id)
  } catch (err) {
    console.error('Delete supplier error:', err)
    store.commit('suppliers/SET_ERROR', 'Не удалось удалить поставщика. Возможно, существуют связанные поставки.')
  }
}

onMounted(async () => {
  try {
    await store.dispatch('suppliers/fetchSuppliers')
  } catch (err) {
    console.error('Fetch suppliers error:', err)
  }
})
</script>

<style scoped>
.add-supplier-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-supplier-button:hover {
  background-color: #3aa876;
}
</style>
