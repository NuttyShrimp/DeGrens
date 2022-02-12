<template>
  <div :class="[color ? color : '', multiline ? 'multiline' : '']" class="msg">
    <span v-html="textEscaped"></span>
  </div>
</template>

<script lang="ts" src="./Message.ts"></script>
