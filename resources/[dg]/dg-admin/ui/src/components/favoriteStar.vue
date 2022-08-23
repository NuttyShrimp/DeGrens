<template>
  <div class="menu-favorite-button" @click.stop="toggleFavorite">
    <q-icon
      :color="props.favorite ? 'yellow-6' : 'grey-9'"
      :name="`${props.favorite ? 'fa-solid' : 'fa-regular'} fa-star`"
      size="1.2rem"
    />
  </div>
</template>
<script setup lang="ts">
  import { useStore } from '@/lib/store';
  const store = useStore();
  const props = defineProps<{
    name: string;
    favorite: boolean;
  }>();
  const toggleFavorite = () => {
    store.dispatch('toggleFavoriteAction', {
      name: props.name,
      favorite: !props.favorite,
    });
  };
</script>
<style lang="scss">
  .menu-favorite-button {
    padding: 0 1vh;
  }
</style>
