<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';

  import Wrapper from './components/Wrapper.vue';
  import { nuiAction } from './lib/nui/action';
  import { events } from './lib/nui/events';

  import './styles/app.scss';

  const msgListener = (event: MessageEvent) => {
    if (!event?.data || !events[event?.data?.action]) {
      return;
    }
    events[event.data.action](event.data.data);
  };

  onMounted(() => {
    console.log(import.meta.env);
    window.addEventListener('message', msgListener);
    nuiAction('nui_mounted');
  });
  onUnmounted(() => {
    window.removeEventListener('message', msgListener);
  });
</script>

<template>
  <Wrapper />
</template>
