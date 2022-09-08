<template>
  <div v-ripple :class="`menu-action-container ${props.active ? 'active' : ''}`" @click.stop="emit('click')">
    <FavoriteStar v-show="props.canFavorite" :favorite="props.action.favorite ?? false" :name="props.action.name" />
    <div class="menu-action-title">
      {{ props.action.title }}
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
  import { theme } from '@/lib/colors';

  import { BaseAction } from '../../types/common';
  import FavoriteStar from '../favoriteStar.vue';

  const props = defineProps<{ action: BaseAction & { favorite?: boolean }; active?: boolean; canFavorite?: boolean }>();
  const emit = defineEmits<{ (e: 'click'): void }>();
</script>
<style lang="scss">
  .menu-action {
    &-container {
      position: relative;
      display: flex;
      align-items: center;

      min-height: 5vh;
      margin: 0.5vh 0;
      padding: 0.5vh;
      border-radius: 0.2vh;

      color: $grey-9;
      background-color: v-bind('theme.primary.lighter');
      box-shadow: rgb(0 0 0 / 20%) 0px 0.1vh 0.2vh -0.1vh, rgb(0 0 0 / 14%) 0px 0.2vh 0.25vh,
        rgb(0 0 0 / 12%) 0px 0.1vh 0.5vh;

      cursor: pointer;
      user-select: none;

      &.active {
        padding: 0;
        border: 0.5vh solid v-bind('theme.primary.normal');
      }
    }

    &-title {
      font-size: 1em;
      width: 100%;
      word-break: normal;
    }

    &-binds {
      width: 20vh;
      margin-right: 1vh;
    }

    &-icon {
      margin-right: 1vh;
      transition: transform 0.2s ease-in-out;
    }

    &-inputs {
      padding: 0 1vh;

      & > * {
        margin: 1vh 0;
      }
    }
  }
</style>
