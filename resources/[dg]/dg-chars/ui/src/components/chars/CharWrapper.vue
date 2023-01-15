<template>
  <div id="selector-body" @click="doContextMenu" @contextmenu="doContextMenu" @mousemove="getXYPos">
    <info-box v-if="!!curChar" :loc="{ top: `${yPos + 16}px`, left: `${xPos + 16}px` }" />
  </div>
</template>

<script lang="ts">
  import $ from 'jquery';
  import { computed, defineComponent, onMounted, ref } from 'vue';

  import { nuiAction } from '../../lib/nui/action';
  import { useStore } from '../../lib/store';

  import InfoBox from './InfoBox.vue';

  export default defineComponent({
    name: 'CharWrapper',
    components: { InfoBox },
    setup() {
      const store = useStore();
      const curChar = computed(() => store.state.currentCharacter);
      const isPosFrozen = computed(() => store.state.freezePosition);
      const xPos = ref(0);
      const yPos = ref(0);
      let hoverWait = false;
      const getXYPos = async (e: MouseEvent) => {
        if (isPosFrozen.value) {
          return;
        }
        xPos.value = e.pageX;
        yPos.value = e.pageY;
        if (hoverWait) {
          return;
        }
        const relX = e.pageX - ($(e.target as any).offset()?.left ?? 0);
        const relY = e.pageY - ($(e.target as any).offset()?.top ?? 0);
        hoverWait = true;
        setTimeout(() => {
          hoverWait = false;
        }, 100);
        const selCid = await nuiAction('cursorMove', {
          x: relX / document.body.scrollWidth,
          y: relY / document.body.scrollHeight,
        });
        selCid ? store.dispatch('setHoveringChar', selCid) : store.dispatch('setInAir');
      };

      const doContextMenu = () => {
        if (!curChar.value) {
          return;
        }
        store.commit('setFreezePosition', true);
      };

      const unFreeze = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          store.commit('setFreezePosition', false);
        }
      };

      onMounted(() => {
        document.addEventListener('keydown', unFreeze);
      });

      return {
        xPos,
        yPos,
        curChar,
        doContextMenu,
        unFreeze,
        getXYPos,
      };
    },
  });
</script>
