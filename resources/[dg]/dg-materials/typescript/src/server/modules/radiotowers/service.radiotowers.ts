import { getConfig } from 'services/config';
import { TOWER_STATE_KEYS } from './constants.radiotowers';
import { Events, Util } from '@dgx/server';
import { radioTowerLogger } from './logger.radiotowers';

const towerStates: Record<string, Materials.Radiotowers.State> = {};
const playersAtTower: Record<string, Set<number>> = {};

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
    playersAtTower[towerId] = new Set();
  });

  // wait random amount before first time available since restart
  const rndMinutes = Util.getRndInteger(30, 60);
  setTimeout(() => {
    radioTowerIds.forEach(towerId => {
      resetTowerState(towerId, false);
    });
  }, rndMinutes * 60 * 1000);
};

export const setPlayerAtTower = (towerId: string, plyId: number) => {
  playersAtTower[towerId]?.add(plyId);
};

export const playerLeftTower = (towerId: string, plyId: number) => {
  playersAtTower[towerId]?.delete(plyId);
};

export const isAnyPlayerAtTower = (towerId: string) => {
  return (playersAtTower[towerId]?.size ?? 0) > 0;
};

export const tryToSpawnTowerPeds = (towerId: string, plyId: number) => {
  if (getTowerState(towerId).pedsSpawned) return;

  setTowerState(towerId, 'pedsSpawned', true);
  Events.emitNet('materials:radiotower:spawnPed', plyId, towerId);
};

// We check if anyone at tower, spawn peds and call function again after 5 min
export const spawnPedSwarm = (towerId: string) => {
  if (!isAnyPlayerAtTower(towerId)) return;

  const targetPly = [...playersAtTower[towerId]][0];
  Events.emitNet('materials:radiotower:spawnSwarm', targetPly, towerId);

  // recusively spawn spawm every 5 min
  setTimeout(() => {
    spawnPedSwarm(towerId);
  }, 2 * 60 * 1000);
};
