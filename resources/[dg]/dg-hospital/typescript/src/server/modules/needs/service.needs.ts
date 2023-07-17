import { Core, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { needsLogger } from './logger.needs';
import { charModule } from 'services/core';

let depletionThread: NodeJS.Timer | null = null;

export const startNeedsThread = () => {
  const needsConfig = getHospitalConfig().needs;
  if (depletionThread) {
    clearInterval(depletionThread);
  }
  depletionThread = setInterval(() => {
    const players = Object.values(charModule.getAllPlayers());
    for (const player of players) {
      const needs = { ...player.metadata.needs };
      for (const key of Object.keys(needs) as CharacterNeed[]) {
        const old = needs[key];
        needs[key] = old - needsConfig.depletionRates[key];
      }
      player.updateMetadata('needs', needs);
      emitNet('hud:client:UpdateNeeds', player.serverId, needs.hunger, needs.thirst);
    }
    needsLogger.debug('Depleting needs for all players');
  }, needsConfig.interval * 1000);
};

export const setNeed = (plyId: number, need: CharacterNeed, cb: (old: number) => number) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;

  const needs = { ...player.metadata.needs };
  const newValue = cb(needs[need]);
  const clampedValue = Math.max(0, Math.min(100, newValue));
  needs[need] = clampedValue;
  player.updateMetadata('needs', needs);
  emitNet('hud:client:UpdateNeeds', plyId, needs.hunger, needs.thirst);
  needsLogger.silly(`Changed ${need} to ${clampedValue} for ${Util.getName(plyId)}`);
};

export const getNeed = (plyId: number, need: CharacterNeed) => {
  const player = Core.getPlayer(plyId);
  if (!player) return 100;

  const needs = { ...player.metadata.needs };
  return needs?.[need] ?? 100;
};
