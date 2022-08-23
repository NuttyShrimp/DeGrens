import { Module } from 'vuex';

import { Player } from '../../types/common';
import { PenaltyStore, State } from '../../types/state';
import { nuiAction } from '../nui/action';

export const penaltyStore: Module<PenaltyStore, State> = {
  namespaced: true,
  state: {
    visible: false,
    classes: {},
    reasons: {},
    currentTarget: null,
  },
  mutations: {
    setInfo(state, { classes, reasons }) {
      state.classes = classes;
      state.reasons = reasons;
    },
    setTarget(state, target: Player | null) {
      state.currentTarget = target;
    },
    setVisible(state, visible: boolean) {
      state.visible = visible;
    },
  },
  actions: {
    async loadInfo({ commit }) {
      const info = await nuiAction('getPenaltyInfo');
      commit('setInfo', info);
    },
  },
};
