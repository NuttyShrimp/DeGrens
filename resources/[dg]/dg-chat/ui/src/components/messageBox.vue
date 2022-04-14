<template>
  <div class="message__box">
    <transition
      enter-active-class="animate__animated animate__slideInLeft animate__faster"
      leave-active-class="animate__animated animate__slideOutLeft animate__faster"
      :duration="500"
    >
      <div v-if="shouldShow" id="messageBox" class="message__innerbox">
        <div :class="`message__entry ${message.type ?? ''}`" v-for="(message, id) in messages" :key="id">
          <span v-if="message.prefix">
            <strong>{{ message.prefix }}</strong>
          </span>
          <span v-html="message.message" />
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
  import { computed, defineProps, onMounted, PropType } from 'vue';

  import { testMessages } from '../lib/devdata';
  import { useStore } from '../lib/store';
  import { Chat } from '../types/chat';

  defineProps({
    shouldShow: Boolean as PropType<boolean>,
  });

  const store = useStore();
  const messages = computed<Chat.Message[]>(() => store.getters.getMessages);
  onMounted(async () => {
    if (!import.meta.env.DEV) return;
    for (const message of testMessages) {
      store.commit('addMessage', message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
  store.watch(
    state => state.messages,
    () => {
      const messageBox = document.getElementById('messageBox');
      if (!messageBox) return;
      if (store.state.isScrolling) return;
      setTimeout(() => {
        messageBox.scrollTop = messageBox.scrollHeight;
      }, 0);
    }
  );
</script>
<style lang="scss">
  .message {
    $chat_normal: #2f72b5cc;
    $chat_warning: #ff8800cc;
    $chat_error: #bf2424cc;
    $chat_system: #43396fcc;
    $chat_success: #56ad0acc;

    &__box {
      height: 25vh;
      width: 25vw;
    }

    &__innerbox {
      display: flex;
      flex-flow: row wrap;
      align-content: flex-start;
      margin-top: 2vh;
      margin-left: 2vh;
      width: inherit;
      height: inherit;
      overflow: hidden;
    }

    &__entry {
      background-color: $chat_normal;
      border: 0.4vh solid darken($chat_normal, 10%);
      border-left: none;
      border-top: none;
      color: white;
      border-radius: 0.2rem;

      margin: 0.5vh;
      padding: 1vh;
      width: fit-content;
      max-width: 100%;
      height: fit-content;
      max-height: 100%;
      overflow: hidden;
      word-break: break-word;

      &.warning {
        background-color: $chat_warning;
        border-color: darken($chat_warning, 10%);
      }

      &.error {
        background-color: $chat_error;
        border-color: darken($chat_error, 10%);
      }

      &.system {
        background-color: $chat_system;
        border-color: darken($chat_system, 10%);
      }

      &.success {
        background-color: $chat_success;
        border-color: darken($chat_success, 10%);
      }
    }
  }
</style>
