<template>
  <BaseSelection
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="players"
    label="Target"
    filter-key="name"
  >
    <template v-if="props.modelValue?.name" #selected>
      {{ props.modelValue.name }} ({{ props.modelValue.serverId }} | {{ props.modelValue.steamId }})
    </template>
    <template v-else #selected>
      {{ props.modelValue }}
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section :no-wrap="false">
          {{ scope.opt.name }} ({{ scope.opt.serverId }} | {{ scope.opt.steamId }})
        </q-item-section>
      </q-item>
    </template>
  </BaseSelection>
</template>
<script setup lang="ts">
  import { computed, onMounted } from 'vue';

  import { useStore } from '../../lib/store';
  import { Player } from '../../types/common';

  import BaseSelection from './BaseSelection.vue';

  const store = useStore();
  const players = computed(() => store.state.players);
  const target = computed(() => store.state.target);
  const props = defineProps<{
    modelValue: Player;
  }>();

  onMounted(() => {
    if (!target.value) return;
    emit('update:modelValue', target.value);
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Player): void;
  }>();

  const updateValue = (val: Player) => {
    emit('update:modelValue', val);
  };
</script>
