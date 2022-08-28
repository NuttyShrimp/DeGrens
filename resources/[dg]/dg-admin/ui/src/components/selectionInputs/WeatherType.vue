<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Weather Type"
    filter-key="name"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      {{ props.modelValue?.name ?? '' }}
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false"> {{ scope.opt.name }}</q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { WeatherType } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.weatherTypes ?? []);
  const props = defineProps<{
    modelValue: WeatherType;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: WeatherType): void;
  }>();

  const updateValue = (val: WeatherType) => {
    emit('update:modelValue', val);
  };
</script>
