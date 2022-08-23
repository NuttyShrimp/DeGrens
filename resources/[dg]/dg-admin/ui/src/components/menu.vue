<template>
  <div class="menu-container" v-show="menuOpen">
    <MenuHeader />
    <div class="menu-active">
      <ActionList v-if="currentMenu === 'actions'" />
      <PlayerList v-if="currentMenu === 'players'" />
    </div>
    <MenuFooter />
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import { theme } from '@/lib/colors';

  import { useStore } from '../lib/store';

  import MenuFooter from './footer/MenuFooter.vue';
  import MenuHeader from './header/menuHeader.vue';
  import ActionList from './lists/actionList.vue';
  import PlayerList from './lists/PlayerList.vue';

  const store = useStore();
  const currentMenu = computed(() => store.state.currentMenu);
  const menuOpen = computed(() => store.state.menuOpen);
</script>
<style lang="scss">
  .menu {
    &-container {
      display: flex;
      flex-direction: column;
      position: absolute;
      right: 0;
      top: 5vh;
      height: 90vh;
      width: 40vh;
      background: v-bind('theme.primary.darker');
    }

    &-button-list {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 0.5vh;
      & > * {
        margin: 0.5vh 0;
      }
    }

    &-active {
      width: 100%;
      height: 100%;
      background: v-bind('theme.primaryDarker.dark');
    }
  }
</style>
