<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';

  import EntitySelector from './components/entitySelector/index.vue';
  import Menu from './components/menu.vue';
  import PenaltyModal from './components/penaltyModal.vue';
  import { nuiAction } from './lib/nui/action';
  import { events } from './lib/nui/events';
  import { useStore } from './lib/store';

  import './styles/reset.scss';

  const store = useStore();

  const msgListener = (event: MessageEvent) => {
    if (!event?.data || !events[event?.data?.action]) {
      return;
    }
    events[event.data.action](event.data.data);
  };

  const keypressHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      nuiAction('closeMenu');
      store.commit('setMenuVisible', false);
      store.commit('selector/setVisible', false);
      store.commit('penalty/setVisible', false);
      store.commit('penalty/setTarget', null);
    }
  };

  onMounted(() => {
    window.addEventListener('message', msgListener);
    window.addEventListener('keydown', keypressHandler);
    store.dispatch('loadActions');
    store.dispatch('selector/fetchActions');
    store.dispatch('penalty/loadInfo');
  });
  onUnmounted(() => {
    window.removeEventListener('message', msgListener);
    window.removeEventListener('keydown', keypressHandler);
  });
</script>

<template>
  <Menu />
  <PenaltyModal />
  <EntitySelector />
</template>
