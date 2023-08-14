<template>
  <div>
    <div class="player-card-title text-body1" @click.prevent="toggleInfo">
      <p>{{ props.player.name }} ({{ props.player.serverId }})</p>
      <q-icon :name="`${isTargeted ? 'fas fa-' : 'las la-'}map-pin`" @click.stop="setTarget" />
    </div>
    <div class="player-card-info" v-show="extended">
      <div class="player-card-info-table">
        <div>
          <div v-for="info in Object.keys(props.player)" :key="info">
            <p>
              <b> {{ info }}: </b>
            </p>
            <hr />
          </div>
        </div>
        <div>
          <div v-for="info in Object.values(props.player)" :key="info">
            <p>
              {{ info }}
            </p>
            <hr />
          </div>
        </div>
      </div>
      <div class="justify-between row">
        <q-btn label="penalise" color="deep-orange" @click="penalisePlayer" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { theme } from '@/lib/colors';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';
  import { Player } from '../../types/common';

  const props = defineProps<{
    player: Player;
  }>();
  const store = useStore();
  const isTargeted = computed(() => store.state.target?.steamId === props.player.steamId);
  const extended = ref(false);

  const setTarget = () => {
    store.commit('setTarget', !isTargeted.value ? props.player : null);
  };
  const toggleInfo = () => {
    extended.value = !extended.value;
  };

  const penalisePlayer = () => {
    nuiAction('doAction', {
      name: 'penalise',
      inputs: {
        Target: props.player,
      },
    });
  };
</script>
<style lang="scss">
  .player-card {
    &-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 3vh;
      margin: 0.5vh 0;
      padding: 0.5vh;
      border-radius: 0.2vh;

      color: $grey-9;
      background-color: v-bind('theme.primary.lighter');
      box-shadow:
        rgb(0 0 0 / 20%) 0px 0.1vh 0.2vh -0.1vh,
        rgb(0 0 0 / 14%) 0px 0.2vh 0.25vh,
        rgb(0 0 0 / 12%) 0px 0.1vh 0.5vh;

      cursor: pointer;
    }

    &-info {
      width: 100%;
      padding: 0.75vh 0.5vh;

      box-shadow:
        rgb(0 0 0 / 20%) 0px 0.1vh 0.2vh -0.1vh,
        rgb(0 0 0 / 14%) 0px 0.2vh 0.25vh,
        rgb(0 0 0 / 12%) 0px 0.1vh 0.5vh;
      border: 0.2vh solid v-bind('theme.primary.lighter');
      &-table {
        display: flex;
        width: 100%;

        & > div:first-child {
          padding-right: 0.2vh;
        }

        & > div:last-child {
          width: 100%;
        }
      }
    }
  }
</style>
