import { getConfig } from 'services/config';
import { TOWER_DEFAULT_STATE } from './constants.radiotowers';

const towerStates: Record<string, Materials.Radiotowers.State> = {};

export const getTowerState = (towerId: string) => towerStates[towerId];

export const setTowerState = <T extends keyof Materials.Radiotowers.State>(
  towerId: string,
  key: T,
  value: Materials.Radiotowers.State[typeof key]
) => {
  towerStates[towerId][key] = value;
};

export const setDefaultState = (towerId: string) => {
  towerStates[towerId] = { ...TOWER_DEFAULT_STATE };
};

export const initializeRadiotowerStates = () => {
  Object.keys(getConfig().radiotowers.towers).forEach(towerId => {
    setDefaultState(towerId);
  });
};

export const shouldSpawnTowerPeds = (towerId: string) => {
  if (getTowerState(towerId).pedsSpawned) return false;
  setTowerState(towerId, 'pedsSpawned', true);
  return true;
};
