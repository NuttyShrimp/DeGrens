<template>
  <div class="players-list-container">
    <div class="players-list-input">
      <q-input v-model="searchValue" label="Search" dense />
    </div>
    <div class="players-list-players">
      <div v-for="player in players" :key="player.serverId">
        <Player :player="player" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { useStore } from '../../lib/store';
  import Player from '../Player/Player.vue';

  const store = useStore();
  const searchValue = ref('');
  const players = computed(() => store.getters.getPlayers(searchValue.value));
</script>
<style lang="scss">
  .players-list {
    &-container {
      width: 100%;
      padding: 0 1vh;
    }

    &-input {
      width: 100%;
    }

    &-players {
      height: 76vh;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 0;
        background: transparent;
      }
    }
  }
</style>
