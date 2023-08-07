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

  @media screen and (max-height: 720px) {
    html,
    body {
      font-size: 12px;
    }
  }

  @media screen and (min-height: 1400px) {
    html,
    body {
      font-size: 24px;
    }
  }

  @media screen and (min-height: 2120px) {
    html,
    body {
      font-size: 48px;
    }
  }
</style>
