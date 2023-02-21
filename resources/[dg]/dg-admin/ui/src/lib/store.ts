import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

import { Action, MenuTab, Player } from '../types/common';
import { State } from '../types/state';

import { nuiAction } from './nui/action';
import { dataStore } from './store_modules/dataStore';
import { penaltyStore } from './store_modules/penaltyStore';
import { selectorStore } from './store_modules/selectorStore';
import { devDataPlugin } from './devdata';
import { isKeyOfObject } from './util';

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    currentMenu: 'actions',
    menuOpen: false,
    target: null,
    devMode: false,
    actions: [],
    players: [],
    binds: {},
  },
  getters: {
    getBindForCmd(state) {
      return (cmd: string): string | null => {
        const binds = Object.keys(state.binds);
        for (const bind of binds) {
          if (state.binds[bind] === cmd) {
            return bind;
          }
        }
        return null;
      };
    },
    getActions: state => (filter: string) => {
      if (filter === '') return state.actions;
      return state.actions.filter(a => a.title.toLowerCase().includes(filter));
    },
    getPlayers: state => (filter: string) => {
      if (filter === '') return state.players;
      return state.players.filter(a => {
        for (const key in a) {
          if (
            String(a[key as keyof Player])
              .toLowerCase()
              .includes(filter)
          )
            return true;
        }
        return false;
      });
    },
  },
  mutations: {
    setActions(state, actions: Action[]) {
      actions.sort((a, b) => {
        // check favorite
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.title.localeCompare(b.title);
      });
      state.actions = [...actions];
    },
    setDevMode(state, toggle: boolean) {
      state.devMode = toggle;
    },
    setTarget(state, target: Player | null) {
      state.target = target;
    },
    setMenu(state, tab: MenuTab) {
      state.currentMenu = tab;
    },
    setMenuVisible(state, isVisible: boolean) {
      state.menuOpen = isVisible;
    },
    setPlayers(state, players: Player[]) {
      players.sort((p1, p2) => p1.serverId - p2.serverId);
      state.players = players;
    },
    setBind(state, bind: { name: string; bind: string }) {
      const binds = { ...state.binds };
      Object.keys(binds).forEach(key => {
        if (binds[key] === bind.name && key !== bind.name) {
          nuiAction('assignBind', {
            bind: key,
            name: null,
          });
          binds[key] = null;
        }
      });
      binds[bind.bind] = bind.name;
      state.binds = binds;
    },
    setBinds(state, binds: Record<string, string>) {
      state.binds = binds;
    },
  },
  actions: {
    async loadPlayers({ commit }) {
      const players = await nuiAction('getPlayers');
      commit('setPlayers', players);
    },
    async loadActions({ commit }) {
      const result = await nuiAction<Action[]>('getAvailableActions');
      commit('setActions', result);
      const binds = await nuiAction<Record<string, string>>('getBinds');
      commit('setBinds', binds);
    },
    async toggleFavoriteAction({ state, commit }, data: { name: string; favorite: boolean }) {
      if (!state.actions.find(a => a.name && a.favorite !== data.favorite)) return;
      await nuiAction('setActionFavorite', data);
      commit(
        'setActions',
        state.actions.map(a => (a.name === data.name ? { ...a, favorite: data.favorite } : a))
      );
    },
    async toggleDevMode({ state, commit }) {
      await nuiAction('toggleDevMode', {
        toggle: !state.devMode,
      });
      commit('setDevMode', !state.devMode);
    },
    // actions used to trigger an action
    async toggleAction({ state, commit }, data: { name: string; toggled: boolean }) {
      const actions = [...state.actions];
      const actionIdx = actions.findIndex(a => a.name === data.name && isKeyOfObject('toggled', a));
      if (actionIdx < 0) return;
      await nuiAction('toggleAction', data);
      actions[actionIdx].toggled = data.toggled;
      commit('setActions', actions);
    },
    async assignBind({ state, commit }, data: { name: string; bind: string }) {
      const action = state.actions.find(a => a.name === data.name);
      if (!action || action.bindable === undefined) return;
      await nuiAction('assignBind', data);
      commit('setBind', data);
    },
  },
  modules: { data: dataStore, penalty: penaltyStore, selector: selectorStore },
  plugins: [devDataPlugin],
});

export function useStore() {
  return baseUseStore(key);
}
