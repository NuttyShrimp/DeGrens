import { Module } from 'vuex';

import { BaseAction } from '../../types/common';
import { SelectorStore, State } from '../../types/state';
import { devData } from '../devdata';
import { nuiAction } from '../nui/action';

export const selectorStore: Module<SelectorStore, State> = {
  namespaced: true,
  state: {
    visible: false,
    type: 0,
    name: '',
    actions: [],
  },
  getters: {
    actions: state => state.actions[state.type],
  },
  mutations: {
    setVisible(state, visible: boolean) {
      state.visible = visible;
    },
    setType(state, type: number) {
      state.type = type;
    },
    setName(state, name: string) {
      state.name = name;
    },
    setActions(state, actions: BaseAction[][]) {
      state.actions = actions;
    },
  },
  actions: {
    async fetchActions({ commit }) {
      const actions = await nuiAction('getSelectorActions', {}, devData.selectorActions);
      commit('setActions', actions);
    },
  },
};
