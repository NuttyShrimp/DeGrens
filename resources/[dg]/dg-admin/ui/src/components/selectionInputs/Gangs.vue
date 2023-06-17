<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Gang Name"
    :filter-keys="['name', 'label', 'owner']"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      {{ props.modelValue?.label ?? '' }} ({{ props.modelValue.name ?? '' }} | CID: {{ props.modelValue.owner ?? '' }})
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false">
          {{ scope.opt.label }} ({{ scope.opt.name }} | CID: {{ scope.opt.owner }})</q-item-section
        >
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { Gang } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.gangs ?? []);
  const props = defineProps<{
    modelValue: Gang;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Gang): void;
  }>();

  const updateValue = (val: Gang) => {
    emit('update:modelValue', val);
  };
</script>
