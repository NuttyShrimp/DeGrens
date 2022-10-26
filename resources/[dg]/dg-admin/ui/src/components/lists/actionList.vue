<template>
  <div class="action-list-container">
    <div class="action-list-input">
      <q-input v-model="searchValue" label="Search" dense />
    </div>
    <div class="action-list-actions">
      <div v-for="action in actions" :key="action.name">
        <Action :action="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { useStore } from '@/lib/store';

  import Action from '../actions/Action.vue';

  const store = useStore();
  const searchValue = ref('');
  const actions = computed(() => store.getters.getActions(searchValue.value.toLowerCase()));
</script>

<style lang="scss">
  .action-list {
    &-container {
      width: 100%;
      padding: 0 1vh;
    }

    &-input {
      width: 100%;
    }

    &-actions {
      height: 76vh;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 0;
        background: transparent;
      }
    }
  }
</style>
