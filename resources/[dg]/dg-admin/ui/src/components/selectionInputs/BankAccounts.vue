<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Bank Account"
    :filter-keys="['name']"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      {{ props.modelValue?.name ?? '' }} ({{ props.modelValue?.id ?? '' }} | {{ props.modelValue?.owner ?? '' }} |
      {{ props.modelValue?.type ?? '' }})
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false">
          {{ scope.opt.id }} ({{ scope.opt.name }}|{{ scope.opt.owner }}|{{ scope.opt.type }})
        </q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { BankAccount } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.routingBuckets ?? []);
  const props = defineProps<{
    modelValue: BankAccount;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: BankAccount): void;
  }>();

  const updateValue = (val: BankAccount) => {
    emit('update:modelValue', val);
  };
</script>
