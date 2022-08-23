<template>
  <q-tabs
    :modelValue="currentTab"
    @update:modelValue="updateMenu"
    dense
    inline-label
    active-class="menu-header-active-tab"
    content-class="menu-header-tab"
    indicator-color="transparent"
  >
    <q-tab name="actions" label="Actions" icon="fa-solid fa-wand-magic-sparkles" :ripple="false" />
    <q-tab name="players" label="Players" icon="fa-solid fa-rectangle-list" :ripple="false" />
  </q-tabs>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStore } from '../../lib/store';
  import { MenuTab } from '../../types/common';

  const store = useStore();
  const currentTab = computed(() => store.state.currentMenu);
  const updateMenu = (newVal: MenuTab) => {
    store.commit('setMenu', newVal);
  };
</script>
<style lang="scss">
  .menu-header {
    &-tab {
      & > div {
        flex: 1 0 50% !important;
        border-bottom: 0.2vh solid white;
        padding: 0.2vh 0.2vh 0;
      }
    }
    &-active-tab {
      border: 0.2vh solid white;
      border-bottom: 0 !important;
      padding: 0 !important;
      padding-bottom: 0.2vh !important;
    }
  }
</style>
