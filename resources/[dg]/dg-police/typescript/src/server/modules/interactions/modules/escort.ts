import { RPC, Hospital, Events, Util } from '@dgx/server';
import { isPlayerInActiveInteraction } from '../service.interactions';
import { isPlayerCuffed } from './cuffs';

// Key: dragger, value: getting escorted
const escortingPlayers = new Map<number, number>();

export const isPlayerEscorting = (plyId: number) => escortingPlayers.has(plyId);
export const isPlayerBeingEscorted = (plyId: number) => {
  return Array.from(escortingPlayers.values()).includes(plyId);
};

/**
 * Get serverId of player who is being escorted by provided player
 */
export const getPlayerBeingEscorted = (plyId: number) => {
  return escortingPlayers.get(plyId);
};

/**
 * Get serverId of player who is escorting provided player
 */
export const getPlayerEscorting = (plyId: number) => {
  for (const [origin, target] of escortingPlayers) {
    if (target !== plyId) continue;
    return origin;
  }
};

RPC.register('police:interactions:canEscortPlayer', (src: number, target: number): boolean => {
  // Player cannot be already in interaction or be down/cuffed
  if (isPlayerCuffed(src) || Hospital.isDown(src) || isPlayerInActiveInteraction(src)) return false;

  // Distance check to allow for desync
  const targetCoords = Util.getPlyCoords(target);
  if (Util.getPlyCoords(src).distance(targetCoords) > 5) return false;

  // Target cannot already be in interaction and must be down or cuffed
  if (isPlayerInActiveInteraction(target)) return false;

  return isPlayerCuffed(target) || Hospital.isDown(target);
});

Events.onNet('police:interactions:escort', (src: number, target: number) => {
  escortingPlayers.set(src, target);
  Events.emitNet('police:interactions:getEscorted', target, src);
  Util.Log(
    'police:interactions:escort',
    { target, distance: Util.getDistanceToPlayer(src, target) },
    `${Util.getName(src)} has started escorting a player`,
    src
  );
});

Events.onNet('police:interactions:stopEscort', (src: number) => {
  stopEscorting(src);
});

export const stopEscorting = (plyId: number, emitOverrideEvent = false) => {
  const player = escortingPlayers.get(plyId);
  if (!player) return;
  Events.emitNet('police:interactions:detachEscorted', player);
  if (emitOverrideEvent) {
    Events.emitNet('police:interactions:overrideStoppedEscort', plyId);
  }
  escortingPlayers.delete(plyId);
  Util.Log(
    'police:interactions:stopEscort',
    { target: player },
    `${Util.getName(plyId)} has stopped escorting a player`,
    plyId
  );
};

global.exports('getPlayerBeingEscorted', getPlayerBeingEscorted);
