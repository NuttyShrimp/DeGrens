<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Vehicle Model"
    filter-key="model"
  >
    <template v-if="props.modelValue?.model !== undefined" #selected>
      <p>
        {{ props.modelValue?.model ?? '' }} ({{ props.modelValue.brand ?? '' }} {{ props.modelValue.name ?? '' }} | {{ props.modelValue.class ?? '' }})
      </p>
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false">
          {{ scope.opt.model }} ({{ scope.opt.brand }} {{ scope.opt.name }} | {{ scope.opt.class }})
        </q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { Vehicle } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.vehicleModels ?? []);
  const props = defineProps<{
    modelValue: Vehicle;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Vehicle): void;
  }>();

  const updateValue = (val: Vehicle) => {
    emit('update:modelValue', val);
  };
</script>
