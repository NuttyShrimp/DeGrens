import { getConfig } from 'services/config';
import { TOWER_STATE_KEYS } from './constants.radiotowers';
import { Events, Util, Jobs } from '@dgx/server';
import { radioTowerLogger } from './logger.radiotowers';

const towerStates: Record<string, Materials.Radiotowers.State> = {};
const playersAtTower: Record<string, Set<number>> = {};

let swarmTimeout: NodeJS.Timeout | null = null;

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
  const rndMinutes = Util.isDevEnv() ? 1 : Util.getRndInteger(30, 60);
  setTimeout(() => {
    radioTowerIds.forEach(towerId => {
      resetTowerState(towerId, false);
    });
  }, rndMinutes * 60 * 1000);
};

export const setPlayerAtTower = (towerId: string, plyId: number) => {
  // if no one here yet, start timeout for ped swarm starts
  // if (!isAnyPlayerAtTower(towerId) && swarmTimeout === null) {
  //   swarmTimeout = setTimeout(() => {
  //     swarmTimeout = null;
  //     spawnPedSwarm(towerId);
  //   }, 10 * 60 * 1000);
  // }

  playersAtTower[towerId]?.add(plyId);
};

export const playerLeftTower = (towerId: string, plyId: number) => {
  playersAtTower[towerId]?.delete(plyId);

  // clear spawn timeout when last ply left
  if (!isAnyPlayerAtTower(towerId) && swarmTimeout !== null) {
    clearTimeout(swarmTimeout);
  }
};

const isAnyPlayerAtTower = (towerId: string) => {
  return (playersAtTower[towerId]?.size ?? 0) > 0;
};

const isAnyEMSAtTower = (towerId: string) => {
  for (const ply of playersAtTower[towerId]) {
    const job = Jobs.getCurrentJob(ply);
    if (job === 'police' || job === 'ambulance') {
      return true;
    }
  }
  return false;
};

export const tryToSpawnTowerPeds = (towerId: string, plyId: number) => {
  if (getTowerState(towerId).pedsSpawned) return;

  setTowerState(towerId, 'pedsSpawned', true);
  Events.emitNet('materials:radiotower:spawnPed', plyId, towerId);
};

// We check if anyone at tower, spawn peds and call function again after 5 min
const spawnPedSwarm = (towerId: string) => {
  if (!isAnyPlayerAtTower(towerId)) return;

  // dont spawn peds if any police or ambu is at tower
  if (!isAnyEMSAtTower(towerId)) {
    const targetPly = [...playersAtTower[towerId]][0];
    Events.emitNet('materials:radiotower:spawnSwarm', targetPly, towerId);
  }

  // recusively spawn spawn every 5 min
  swarmTimeout = setTimeout(() => {
    spawnPedSwarm(towerId);
  }, 2 * 60 * 1000);
};

export const getTowerPlyAt = (plyId: number) => {
  for (const towerId in playersAtTower) {
    if (playersAtTower[towerId]?.has(plyId)) {
      return towerId;
    }
  }
};

export const debugTowerPlayers = () => {
  for (const towerId in playersAtTower) {
    console.log(towerId);
    console.log([...playersAtTower[towerId]]);
  }
};
