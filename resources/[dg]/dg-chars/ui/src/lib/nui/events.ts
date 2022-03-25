import { store } from '../store';

export const events: { [k: string]: (data: any) => void } = {};

events.openCharUI = data => {
  store.commit('setCharacters', data);
  store.commit('setShow', true);
};

events.closeCharUI = () => {
  store.commit('setShow', false);
  store.commit('setCharacters', []);
  store.commit('setCurrentCharacter', null);
  store.commit('setFreezePosition', false);
};

events.openSpawnUI = () => {
  store.commit('spawn/setShow', true);
};

events.seedSpawnsLocs = locs => {
  store.commit('spawn/setLocations', locs);
};
