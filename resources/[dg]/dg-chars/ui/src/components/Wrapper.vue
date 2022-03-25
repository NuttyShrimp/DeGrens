<template>
  <CharWrapper v-if="shouldShowChar" />
  <SpawnWrapper v-if="shouldShowSpawn" />
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';

  import { useStore } from '../lib/store';

  import CharWrapper from './chars/CharWrapper.vue';
  import SpawnWrapper from './spawns/SpawnWrapper.vue';

  export default defineComponent({
    name: 'Wrapper',
    components: {
      CharWrapper,
      SpawnWrapper,
    },
    setup() {
      const store = useStore();
      const shouldShowChar = computed(() => store.state.show);
      const shouldShowSpawn = computed(() => store.state.spawn?.show ?? false);
      return {
        shouldShowChar,
        shouldShowSpawn,
      };
    },
  });
</script>
