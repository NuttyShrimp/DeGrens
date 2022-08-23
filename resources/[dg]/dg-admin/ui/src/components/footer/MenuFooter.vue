<template>
  <div class="menu-footer-wrapper">
    <q-btn
      unelevated
      icon="fas fa-code"
      size="sm"
      padding="sm"
      :color="devModeOn ? 'primary' : 'grey-8'"
      @click="toggleDevMode"
    />
    <q-btn unelevated icon="fas fa-clipboard-list" size="sm" padding="sm" color="grey-8" @click="copyCoords">
      <q-tooltip anchor="bottom middle" self="top middle"> Copy coords </q-tooltip>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';
  import { copyToClipboard } from '../../lib/util';

  const store = useStore();
  const devModeOn = computed(() => store.state.devMode);
  const toggleDevMode = () => {
    store.dispatch('toggleDevMode');
  };
  const copyCoords = async () => {
    const coords = await nuiAction('copyCoords');
    copyToClipboard(String(coords));
  };
</script>
<style lang="scss">
  .menu-footer {
    &-wrapper {
      display: flex;
      flex-direction: row-reverse;
      padding: 1vh;
      & > * {
        margin-left: 1vh;
      }
    }
  }
</style>
