<template>
  <div class="selector-container" v-show="visible">
    <p class="selector-title">{{ title }}</p>
    <hr />
    <div class="selector-actions">
      <div v-for="action in actions" :key="action.name">
        <DoAction :action="action" @click="() => handleAction(action.name)" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, watch } from 'vue';

  import { theme } from '@/lib/colors';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';
  import { BaseAction } from '../../types/common';
  import DoAction from '../actions/doAction.vue';

  const store = useStore();
  const visible = computed(() => store.state?.selector?.visible ?? false);
  const actions = computed<BaseAction[]>(() => store.getters['selector/actions']);
  const title = computed(() => store.state?.selector?.name ?? '');

  watch(visible, value => {
    if (value) {
      store.dispatch('selector/fetchActions');
    }
  });

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
      max-height: 66vh;

      padding: 2vh;
      border-radius: 1rem;

      color: white;
      background-color: v-bind('theme.primaryDarker.dark + "80"');
    }

    &-actions {
      overflow: auto;
      max-height: 59vh;

      &::-webkit-scrollbar-track {
        background-color: #f5f5f500;
      }

      &::-webkit-scrollbar {
        width: 6px;
        background-color: #f5f5f500;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #1a1a1a;
        border-radius: 1rem;
      }
    }

    &-title {
      text-align: center;
      font-size: 1rem;
    }
  }
</style>
