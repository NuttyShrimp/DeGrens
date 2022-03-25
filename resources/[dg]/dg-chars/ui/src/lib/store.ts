import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

import { SpawnState, spawnState } from './store_modules/spawn';

export interface State {
  show: boolean;
  characters: ICharacter[];
  currentCharacter: ICharacter | null;
  freezePosition: boolean;
  spawn?: SpawnState;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    show: false,
    characters: [],
    currentCharacter: null,
    freezePosition: false,
  },
  mutations: {
    setShow(state, show: boolean) {
      state.show = show;
    },
    setCharacters(state, character: ICharacter[]) {
      state.characters = character;
    },
    setCurrentCharacter(state, character: ICharacter | null) {
      state.currentCharacter = character;
    },
    setFreezePosition(state, freezePosition: boolean) {
      state.freezePosition = freezePosition;
    },
  },
  actions: {
    setHoveringChar(context, charCid: number) {
      const char = context.state.characters.find(c => c.citizenid === charCid);
      if (char) {
        context.commit('setCurrentCharacter', char);
      }
    },
    setInAir(context) {
      context.commit('setCurrentCharacter', null);
    },
  },
  modules: {
    spawn: spawnState,
  },
  // plugins: [devDataPlugin],
});

export function useStore() {
  return baseUseStore(key);
}
