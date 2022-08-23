<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Item"
    filter-key="name"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      <p>
        {{ props.modelValue?.name ?? '' }} ({{ props.modelValue.label ?? '' }} | {{ props.modelValue.size.x ?? 0 }} x
        {{ props.modelValue.size.y ?? 0 }})
      </p>
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false">
          {{ scope.opt.name }} ({{ scope.opt.label }} | {{ scope.opt.size.x }} x {{ scope.opt.size.y }})
        </q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { Item } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.items ?? []);
  const props = defineProps<{
    modelValue: Item;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Item): void;
  }>();

  const updateValue = (val: Item) => {
    emit('update:modelValue', val);
  };
</script>
