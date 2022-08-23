<template>
  <BaseSelection
    :modelValue="props.modelValue ?? plyData?.bucketId ? models.find(b => b.id === plyData?.bucketId) : undefined"
    @update:modelValue="updateValue"
    :options="models"
    label="Routing bucket"
    filter-key="name"
  >
    <template v-if="props.modelValue?.name !== undefined" #selected>
      {{ props.modelValue?.name ?? '' }} ({{ props.modelValue?.id ?? '' }})
    </template>
    <template v-else #selected>
      <p></p>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false"> {{ scope.opt.name }} ({{ scope.opt.id }}) </q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { PlayerData, RoutingBucket } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const models = computed(() => store.state.data?.routingBuckets ?? []);
  const plyData = computed<PlayerData | null>(() => store.state.data?.playerData ?? null);
  const props = defineProps<{
    modelValue: RoutingBucket;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: RoutingBucket): void;
  }>();

  const updateValue = (val: RoutingBucket) => {
    emit('update:modelValue', val);
  };
</script>
