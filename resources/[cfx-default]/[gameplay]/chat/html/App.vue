<template>
  <div id="app">
    <div
      :class="{
        animated: !showWindow && hideAnimated,
        hidden: !showWindow,
      }"
      :style="this.style"
      class="chat-window"
    >
      <div ref="messages" class="chat-messages">
        <message
          v-for="msg in filteredMessages"
          :key="msg.id"
          :args="msg.args"
          :color="msg.color"
          :multiline="msg.multiline"
          :params="msg.params"
          :template="msg.template"
          :template-id="msg.templateId"
          :templates="templates"
        >
        </message>
      </div>
    </div>
    <div class="chat-input">
      <div v-show="showInput" class="input">
        <textarea
          ref="input"
          v-model="message"
          autofocus
          rows="1"
          spellcheck="false"
          type="text"
          @keydown="keyDown"
          @keyup="keyUp"
          @keyup.esc="hideInput"
          @keypress.enter.prevent="send"
        >
        </textarea>
      </div>
      <suggestions :message="message" :suggestions="suggestions"></suggestions>
      <div v-show="showHideState" class="chat-hide-state">
        {{ hideStateString }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./App.ts"></script>
