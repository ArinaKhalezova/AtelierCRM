<template>
  <div class="section">
    <h3>Мерки клиента</h3>
    <MeasurementsForm
      v-if="showForm"
      :initial-measurements="localMeasurements"
      :order-id="orderId"
      @save="handleSave"
      @cancel="showForm = false"
    />
    <MeasurementsView
      v-else
      :measurements="measurements"
      @edit="showForm = true"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import MeasurementsForm from './MeasurementsForm.vue';
import MeasurementsView from './MeasurementsView.vue';

const props = defineProps({
  measurements: {
    type: Object,
    default: null
  },
  orderId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['saved']);

const showForm = ref(false);
const localMeasurements = ref({
  size: "",
  chest_size: null,
  waist_size: null,
  hip_size: null,
  shoulders_width: null,
  height: null,
});

watch(() => props.measurements, (newVal) => {
  if (newVal) {
    localMeasurements.value = { ...newVal };
  } else {
    localMeasurements.value = {
      size: "",
      chest_size: null,
      waist_size: null,
      hip_size: null,
      shoulders_width: null,
      height: null,
    };
  }
}, { immediate: true });

const handleSave = () => {
  showForm.value = false;
  emit('saved');
};
</script>

<style scoped>
.section {
  margin-bottom: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>