<template>
  <div class="input__wrapper">
    <div class="input__field">
      <input
        id="message"
        name="message"
        :value="curValue"
        autofocus
        @blur="handleBlur"
        @input="handleChange"
        @keydown="handleKeyEvent"
      />
    </div>
    <div class="input__suggestions">
      <div class="input__suggestion" v-for="(suggestion, sugIdx) in suggestions" :key="suggestion.name">
        <p>
          <span :class="activeArg === 0 ? 'active' : ''">/{{ suggestion.name }}&nbsp;</span>
          <span
            v-for="(param, idx) in suggestion.parameters"
            :class="Math.min(activeArg, suggestion.parameters.length) === idx + 1 ? 'active' : ''"
            :key="`${suggestion.name}_${param.name}`"
          >
            <span>[{{ param.name }}]&nbsp;</span>
          </span>
        </p>
        <p>
          {{
            activeArg === 0 || sugIdx !== 0
              ? suggestion.description
              : suggestion.parameters[Math.min(activeArg - 1, suggestion.parameters.length - 1)].description
          }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';

  import { nuiAction } from '../lib/nui/action';
  import { useStore } from '../lib/store';
  import { Chat } from '../types/chat';

  export default defineComponent({
    setup() {
      const store = useStore();
      const suggestions = ref<Chat.Suggestion[]>([]);
      const activeArg = ref<number>(0);
      const curValue = ref<string>('');
      // This is the history accessible via arrow up
      const valueHistory = ref<string[]>(store.state.history);
      const curHistory = ref<number>(store.state.history.length);

      const changeMsgScrollTop = (change: number) => {
        const box = document.getElementById('messageBox') as HTMLDivElement;
        box.scrollTop += change;
      };

      const generateSuggestions = (value: string) => {
        if (activeArg.value > 0) return;
        // remove everything after the first space
        const command = value.split(' ')[0];
        suggestions.value = store.getters.getSuggestions(command.trim());
      };

      const handleSpace = (value = curValue.value) => {
        if (activeArg.value === 0 && suggestions.value.length > 0) {
          // Check if first suggestion is same as input
          if (suggestions.value[0].name !== value.replace(/^\//, '').trim()) {
            // not same --> no suggestions
            suggestions.value = [];
          }
        }
        activeArg.value++;
      };

      const handleKeyEvent = (evt: KeyboardEvent) => {
        const input = evt.target as HTMLInputElement;
        switch (evt.key) {
          case 'Enter': {
            store.dispatch('sendMessage', input.value);
            valueHistory.value.push(input.value);
            curHistory.value = valueHistory.value.length;
            curValue.value = '';
            break;
          }
          case 'Escape': {
            input.value = '';
            nuiAction('close');
            break;
          }
          case 'PageUp': {
            changeMsgScrollTop(-100);
            break;
          }
          case 'PageDown': {
            changeMsgScrollTop(100);
            break;
          }
          case 'ArrowUp': {
            if (curHistory.value === valueHistory.value.length) {
              valueHistory.value.push(input.value);
            }
            if (curHistory.value > 0) {
              curHistory.value--;
              curValue.value = valueHistory.value[curHistory.value];
            }
            break;
          }
          case 'ArrowDown': {
            if (curHistory.value < valueHistory.value.length - 1) {
              curHistory.value++;
              curValue.value = valueHistory.value[curHistory.value];
            }
            break;
          }
          case ' ': {
            handleSpace(input.value);
            break;
          }
          default:
            break;
        }
      };

      const handleChange = (evt: Event) => {
        const input = evt.target as HTMLInputElement;
        const remDiff = curValue.value.replace(input.value, '');
        if (remDiff !== curValue.value) {
          const setBack = remDiff.match(/ /g)?.length ?? 0;
          activeArg.value = Math.max(0, activeArg.value - setBack);
        }
        generateSuggestions(input.value);
        valueHistory.value = [...store.getters.getHistory(input.value)];
        curHistory.value = valueHistory.value.length;
        curValue.value = input.value;
      };

      const handleBlur = (evt: Event) => (evt.target as HTMLInputElement).focus();

      onMounted(() => {
        const input = document.getElementById('message') as HTMLInputElement;
        input.focus();
        generateSuggestions('');
      });

      return {
        handleChange,
        handleKeyEvent,
        handleBlur,
        suggestions,
        activeArg,
        curValue,
      };
    },
  });
</script>
<style lang="scss">
  .input {
    &__wrapper {
      width: inherit;
      height: fit-content;
      margin: 0.5vh 0.5vh 0.5vh 2.5vh;
    }

    &__field {
      display: flex;
      align-items: center;
      padding: 0 1vh;
      background-color: #2f3640b2;
      border: 0.4vh solid darken(#2f3640b2, 10%);
      border-top: none;
      border-left: none;

      height: 4vh;

      & > input {
        width: 100%;
        font-size: 1.5vh;
        color: white;

        background: none;
        outline: none;
        border: none;

        &:focus {
          outline: none;
        }
      }
    }

    &__suggestions {
      display: flex;
      flex-direction: column;
    }

    &__suggestion {
      display: flex;
      flex-direction: column;
      padding: 0.5vh;
      background-color: #2f3640b2;
      border: 0.4vh none darken(#2f3640b2, 10%);
      border-right-style: solid;
      border-bottom: 0.2vh solid;

      &:last-of-type {
        border-bottom: 0.4vh solid;
      }

      & > p {
        margin: 0;
        font-size: 1.5vh;
        color: #cacaca;

        & .active {
          color: white;
        }

        &:last-of-type {
          font-size: 1.25vh;
        }
      }
    }
  }
</style>
