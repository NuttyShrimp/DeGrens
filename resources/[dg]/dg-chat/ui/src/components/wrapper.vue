<template>
  <div class="chat-wrapper">
    <MessageBox :shouldShow="showMsgBox" />
    <InputField v-if="showInput" />
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted } from 'vue';

  import { nuiAction } from '../lib/nui/action';
  import { useStore } from '../lib/store';

  import InputField from './inputField.vue';
  import MessageBox from './messageBox.vue';

  const store = useStore();

  const showMsgBox = computed<boolean>(() => store.state.isMsgVisible);
  const showInput = computed<boolean>(() => store.state.isInputVisible);

  onMounted(() => {
    nuiAction('loaded');
  });
</script>
<style lang="scss">
  .chat-wrapper {
    width: 25vw;
  }
</style>
