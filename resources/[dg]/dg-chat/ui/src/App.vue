<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';

  import Wrapper from './components/wrapper.vue';
  import { events } from './lib/nui/events';

  const msgListener = (event: MessageEvent) => {
    if (!event?.data || !events[event?.data?.action]) {
      return;
    }
    events[event.data.action](event.data.data);
  };

  onMounted(() => {
    window.addEventListener('message', msgListener);
  });
  onUnmounted(() => {
    window.removeEventListener('message', msgListener);
  });
</script>

<template>
  <Wrapper />
</template>
<style>
  * {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
  }
</style>
