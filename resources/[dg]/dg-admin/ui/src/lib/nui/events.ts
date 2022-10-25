import { store } from '../store';

import { nuiAction } from './action';

export const events: { [k: string]: (data: any) => void } = {};

events.openMenu = () => {
  nuiAction('logOpenMenu');
  store.commit('setMenuVisible', true);
  store.dispatch('loadPlayers');
  store.dispatch('data/loadData');
};

events.forceCloseMenu = () => {
  nuiAction('closeMenu');
  store.commit('setMenuVisible', false);
  store.commit('selector/setVisible', false);
  store.commit('penalty/setVisible', false);
  store.commit('penalty/setTarget', null);
};

events.openPenaltyModel = (steamId: string) => {
  const target = store.state.players.find(p => p.steamId === steamId);
  if (!target) return;
  store.commit('penalty/setTarget', target);
  store.commit('penalty/setVisible', true);
};

events.showSelector = ({ type, name }: { type: number; name: string }) => {
  store.commit('selector/setType', type);
  store.commit('selector/setName', name);
  store.commit('selector/setVisible', true);
};

events.reloadActions = () => {
  store.dispatch('loadActions');
  store.dispatch('selector/fetchActions');
};

events.overwriteDevmode = async (enabled: boolean) => {
  const isDevEnv = await nuiAction('isDevEnv');
  if (!isDevEnv) return;
  store.commit('setDevMode', enabled);
};

// TODO: add events for when a player joins or leaves
