<template>
  <div class="message__box">
    <transition
      enter-active-class="animate__animated animate__slideInLeft animate__faster"
      leave-active-class="animate__animated animate__slideOutLeft animate__faster"
      :duration="500"
    >
      <div v-if="shouldShow" id="messageBox" class="message__innerbox">
        <template v-for="(message, id) in messages">
          <div :class="`message__entry message__card`" v-if="message.type === 'idcard'" :key="`${id}-card`">
            <div class="message__card__info">
              <p class="message__card__elem message__card__lastname">{{ message.message.lastName }}</p>
              <p class="message__card__elem message__card__firstname">{{ message.message.firstName }}</p>
              <p class="message__card__elem message__card__dob">{{ message.message.dob }}</p>
              <p class="message__card__elem message__card__nationality">{{ message.message.nationality }}</p>
              <p class="message__card__elem message__card__gender">{{ message.message.gender }}</p>
              <p class="message__card__elem message__card__cid">{{ message.message.cid }}</p>
              <div class="message__card__elem message__card__photo">
                <img :src="message.message.gender === 'M' ? 'assets/male.png' : 'assets/female.png'" />
              </div>
            </div>
          </div>
          <div v-else :class="`message__entry ${message.type ?? ''}`" :key="id">
            <span v-if="message.prefix">
              <strong>{{ message.prefix }}</strong>
            </span>
            <span v-html="message.message" />
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, PropType, watchPostEffect } from 'vue';

  import { testMessages } from '../lib/devdata';
  import { useStore } from '../lib/store';
  import { Chat } from '../types/chat';

  defineProps({
    shouldShow: Boolean as PropType<boolean>,
  });

  const store = useStore();
  const messages = computed<Chat.Message[]>(() => store.getters.getMessages);

  watchPostEffect(() => {
    if (!store.state.isMsgVisible) return;
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    if (store.state.isScrolling) return;
    setTimeout(() => {
      messageBox.scrollTop = messageBox.scrollHeight;
    }, 0);
  });

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

    &__card {
      background-color: unset;
      background-image: url('/assets/card.png');
      background-size: auto 20vh;
      background-repeat: no-repeat;
      position: relative;
      border: none;
      padding: 0;
      width: 100%;
      height: 20vh;
      &__img {
        height: 20vh;
        position: absolute;
        top: 0;
        left: 0;
        & > img {
          height: 100%;
          object-fit: contain;
        }
      }
      &__info {
        color: black;
        font-size: 0.75rem;
        position: relative;
        height: inherit;
      }
      &__elem {
        width: fit-content;
        position: absolute;
      }
      &__lastname {
        top: 3.7vh;
        left: 1.1vh;
      }
      &__firstname {
        top: 5.3vh;
        left: 1.1vh;
      }
      &__dob {
        top: 8.3vh;
        left: 24.2vh;
      }
      &__nationality {
        top: 8.3vh;
        left: 16.7vh;
      }
      &__gender {
        top: 8.3vh;
        left: 11.9vh;
      }
      &__cid {
        top: 10.3vh;
        left: 11.8vh;
      }
      &__photo {
        bottom: 1vh;
        left: 1.2vh;
        width: 9.4vh;
        height: 10vh;
        & > img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>
