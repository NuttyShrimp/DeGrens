import { Chat } from '@/types/chat';

import { store } from '../store';

export const events: { [k: string]: (data: any) => void } = {};

events.lockVisibility = (data: boolean) => {
  store.commit('setChatLock', data);
};

events.setInputVisibility = (data: boolean) => {
  store.commit('setIsInputVisible', data);
};
events.setMsgVisibility = (data: boolean) => {
  store.commit('setIsMsgVisible', data);
};

events.setSuggestions = (data: Chat.Suggestion[]) => {
  store.commit('setSuggestions', data);
};

events.addSuggestion = (data: Chat.Suggestion) => {
  store.commit('addSuggestion', data);
};

events.addMessage = (data: Chat.Message) => {
  store.commit('addMessage', data);
};

events.clearChat = () => {
  store.commit('clearMessages');
};
