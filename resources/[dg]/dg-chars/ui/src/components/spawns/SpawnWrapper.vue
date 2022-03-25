<template>
  <transition appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp">
    <div v-if="locations[curLocIdx]" class="spawn-wrapper" @click="toggleList(false)">
      <div class="spawn-body">
        <div>
          <q-btn flat round color="dark" icon="chevron_left" @click="decrement" />
        </div>
        <div class="spawn-label" @click.stop="toggleList()">
          {{ locations[curLocIdx].label }}
        </div>
        <div>
          <q-btn flat round color="dark" icon="chevron_right" @click="increment" />
        </div>
      </div>
      <transition appear enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
        <div v-if="showList" class="spawn-list">
          <div v-for="(location, idx) in locations" :key="idx" @click="setLocation(idx)">
            <div v-if="curLocIdx !== idx" class="spawn-label">
              {{ location.label }}
            </div>
          </div>
        </div>
      </transition>
      <div class="flex flex-center q-mt-sm">
        <q-btn color="primary" size="md" icon="fas fa-map" label="Spawn" @click="triggerSpawn()" />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { useQuasar } from 'quasar';
  import { computed, defineComponent, ref } from 'vue';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';

  export default defineComponent({
    name: 'SpawnWrapper',
    setup() {
      const store = useStore();
      const $q = useQuasar();
      const locations = computed(() => store.state.spawn?.locations ?? []);
      const curLocIdx = ref(0);
      const canMove = ref(true);
      const showList = ref(false);

      const triggerSpawn = async () => {
        await nuiAction('spawn/choose', {
          id: curLocIdx.value + 1,
        });
        store.commit('spawn/setShow', false);
        store.commit('spawn/setLocations', []);
      };

      const moveCamera = async () => {
        canMove.value = false;
        await nuiAction('spawn/move', {
          id: curLocIdx.value + 1,
        });
        canMove.value = true;
      };

      const setLocation = (idx: number) => {
        if (!canMove.value) {
          $q.notify({
            message: 'The camera is still moving',
            position: 'top-right',
            type: 'warning',
          });
          return;
        }
        showList.value = false;
        curLocIdx.value = idx;
        moveCamera();
      };

      const increment = () => {
        let nextIdx = curLocIdx.value + 1;
        if (nextIdx >= locations.value.length) {
          nextIdx = 0;
        }
        setLocation(nextIdx);
      };

      const decrement = () => {
        let prevIdx = curLocIdx.value - 1;
        if (prevIdx < 0) {
          prevIdx = locations.value.length - 1;
        }
        setLocation(prevIdx);
      };

      const toggleList = async (state?: boolean) => {
        showList.value = state !== undefined ? state : !showList.value;
      };

      return {
        locations,
        curLocIdx,
        showList,
        increment,
        decrement,
        toggleList,
        setLocation,
        triggerSpawn,
      };
    },
  });
</script>
