<template>
  <div class="selector-container" v-show="visible">
    <p class="selector-title">{{ title }}</p>
    <hr />
    <div v-for="action in actions" :key="action.name">
      <DoAction :action="action" @click="() => handleAction(action.name)" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { theme } from '@/lib/colors';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';
  import { BaseAction } from '../../types/common';
  import DoAction from '../actions/doAction.vue';

  const store = useStore();
  const visible = computed(() => store.state?.selector?.visible ?? false);
  const actions = computed<BaseAction[]>(() => store.getters['selector/actions']);
  const title = computed(() => store.state?.selector?.name ?? '');

  const handleAction = (name: string) => {
    nuiAction('doSelectorAction', { name });
  };
</script>
<style lang="scss">
  .selector {
    &-container {
      position: absolute;
      top: 30vh;
      right: 55vh;
      width: 35vh;

      padding: 2vh;
      border-radius: 1rem;

      color: white;
      background-color: v-bind('theme.primaryDarker.dark + "80"');
    }

    &-title {
      text-align: center;
      font-size: 1rem;
    }
  }
</style>
