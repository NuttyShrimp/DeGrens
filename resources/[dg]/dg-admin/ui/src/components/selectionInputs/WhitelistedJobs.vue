<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="models"
    label="Whitelisted Job"
    filter-key="name"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      {{ props.modelValue?.name ?? '' }} (ranks: {{ props.modelValue?.ranks ?? 0 }})
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
  import { WhitelistedJob } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.whitelistedJobs ?? []);
  const props = defineProps<{
    modelValue: WhitelistedJob;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: WhitelistedJob): void;
  }>();

  const updateValue = (val: WhitelistedJob) => {
    emit('update:modelValue', val);
  };
</script>
