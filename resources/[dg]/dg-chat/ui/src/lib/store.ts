import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

import { Chat, State } from '../types/chat';
import { devStorePlugin, testMessages } from './devdata';

import { nuiAction } from './nui/action';
import { sanitizeText } from './util';

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    messages: [],
    suggestions: [],
    history: [],
    isMsgVisible: false,
    isInputVisible: false,
    isScrolling: false,
    isLocked: true,
  },
  getters: {
    getMessages: state => state.messages,
    getSuggestions: state => (input: string) => {
      // Only get suggestions that start with the input
      const filtered = state.suggestions.filter(suggestion => suggestion?.name?.startsWith(input.replace(/^\//, '')));
      // Limit to 5 suggestions
      return filtered.slice(0, 5);
    },
    getHistory: state => (input: string) => {
      // Only get suggestions that start with the input and create set to prevent duplicates
      const revHistory = state.history.slice().reverse();
      return new Set(
        revHistory
          .filter(history => history?.startsWith(input.replace(/^\//, '')))
          ?.reverse()
          .filter(m => m.trim() !== '') ?? []
      );
    },
  },
  mutations: {
    clearMessages(state) {
      state.messages = [];
    },
    addMessage(state, message: Chat.Message) {
      if (message.type !== 'idcard') {
        message.message = sanitizeText(message.message);
      }
      state.messages = [...state.messages, message];
    },
    setSuggestions(state, suggestions: Chat.Suggestion[]) {
      state.suggestions = suggestions;
    },
    addSuggestion(state, suggestion: Chat.Suggestion) {
      state.suggestions = [...state.suggestions, suggestion];
    },
    addHistory(state, history: string) {
      if (history.trim() === '') return;
      state.history = [...state.history, history];
    },
    setIsMsgVisible(state, isVisible: boolean) {
      state.isMsgVisible = isVisible;
    },
    setIsInputVisible(state, isVisible: boolean) {
      state.isInputVisible = isVisible;
    },
    setChatLock(state, lock: boolean) {
      state.isLocked = lock;
    },
  },
  actions: {
    sendMessage({ commit }, message: string) {
      commit('addHistory', message);
      nuiAction('sendMessage', { message });
    },
  },
  plugins: [devStorePlugin],
});

export function useStore() {
  return baseUseStore(key);
}
