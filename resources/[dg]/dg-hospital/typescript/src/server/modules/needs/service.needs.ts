import { Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { needsLogger } from './logger.needs';

export const startNeedsThread = () => {
  const needsConfig = getHospitalConfig().needs;
  setInterval(() => {
    const players = [...Object.values(DGCore.Functions.GetQBPlayers())] as Player[];
    for (const player of players) {
      const needs = { ...player.PlayerData.metadata.needs };
      for (const key of Object.keys(needs) as CharacterNeed[]) {
        const old = needs[key];
        needs[key] = old - needsConfig.depletionRates[key];
      }
      player.Functions.SetMetaData('needs', needs);
      emitNet('hud:client:UpdateNeeds', player.PlayerData.source, needs.hunger, needs.thirst);
    }
    needsLogger.info('Depleting needs for all players');
  }, needsConfig.interval * 1000);
};

export const setNeed = (plyId: number, need: CharacterNeed, cb: (old: number) => number) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return;

  const needs = { ...player.PlayerData.metadata.needs };
  const newValue = cb(needs[need]);
  const clampedValue = Math.max(0, Math.min(100, newValue));
  needs[need] = clampedValue;
  player.Functions.SetMetaData('needs', needs);
  emitNet('hud:client:UpdateNeeds', plyId, needs.hunger, needs.thirst);
  needsLogger.info(`Changed ${need} to ${clampedValue} for ${Util.getName(plyId)}`);
};

export const getNeed = (plyId: number, need: CharacterNeed) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return 100;

  const needs = { ...player.PlayerData.metadata.needs };
  return needs?.[need] ?? 100;
};
