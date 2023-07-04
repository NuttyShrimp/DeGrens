<template>
  <div v-if="isDev" class="fixed-bottom-left">
    <div class="q-pa-sm">
      <q-btn color="primary" @click="emulateCharLoad">Load chars</q-btn>
      <q-btn color="primary" @click="emulateExistCharSelect">Select existing char</q-btn>
      <q-btn color="primary" @click="emulateNewCharSelect">Select new char</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useStore } from '../../lib/store';
  const isDev = import.meta.env.DEV;
  const store = useStore();

  const emulateCharLoad = () => {
    const event = new MessageEvent('message', {
      data: {
        action: 'openCharUI',
        data: [
          {
            name: 'Nutty Shrimp',
            citizenid: 1000,
          },
          {
            name: 'Nieuw Karakter',
            citizenid: 1,
          },
        ],
      },
    });
    window.dispatchEvent(event);
  };

  const emulateExistCharSelect = () => {
    store.dispatch('setHoveringChar', 1000);
  };

  const emulateNewCharSelect = () => {
    store.dispatch('setHoveringChar', 1);
  };
</script>
