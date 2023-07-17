import { getConfig } from 'services/config';
import { TOWER_STATE_KEYS } from './constants.radiotowers';
import { Events, Util, Jobs, Npcs } from '@dgx/server';
import { radioTowerLogger } from './logger.radiotowers';

const towerStates: Record<string, Materials.Radiotowers.State> = {};

export const getTowerState = (towerId: string) => towerStates[towerId];

export const setTowerState = <T extends keyof Materials.Radiotowers.State>(
  towerId: string,
  key: T,
  value: Materials.Radiotowers.State[typeof key]
) => {
  towerStates[towerId][key] = value;
};

export const resetTowerState = (towerId: string, enabled: boolean) => {
  const newState = {} as Materials.Radiotowers.State;
  for (const key of TOWER_STATE_KEYS) {
    newState[key] = enabled;
  }
  towerStates[towerId] = newState;
  radioTowerLogger.info(`tower ${towerId} full state has been reset to ${enabled}`);
};

export const initializeRadiotowerStates = () => {
  const radioTowerIds = Object.keys(getConfig().radiotowers.towers);

  // we start as all already done and init the players set
  radioTowerIds.forEach(towerId => {
    resetTowerState(towerId, true);
  });

  // wait random amount before first time available since restart
  const rndMinutes = Util.isDevEnv() ? 1 : Util.getRndInteger(30, 60);
  setTimeout(() => {
    radioTowerIds.forEach(towerId => {
      resetTowerState(towerId, false);
    });
  }, rndMinutes * 60 * 1000);
};

export const tryToSpawnTowerPeds = (towerId: string) => {
  if (getTowerState(towerId).pedsSpawned) return;

  setTowerState(towerId, 'pedsSpawned', true);

  getConfig().radiotowers.towers[towerId].peds.forEach(position => {
    Npcs.spawnGuard({
      model: 's_m_y_blackops_02',
      position,
    });
  });
};
