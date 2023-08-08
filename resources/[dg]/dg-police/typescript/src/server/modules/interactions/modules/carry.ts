import { Hospital, Notifications, Events, Chat, Util, RPC } from '@dgx/server';
import { isPlayerInActiveInteraction } from '../service.interactions';
import { getPoliceConfig } from 'services/config';
import { isPlayerCuffed } from './cuffs';

const carryDuos: { carrier: number; target: number }[] = [];

Chat.registerCommand('carry', 'Neem een persoon op je schouder', [], 'user', async src => {
  if (isPlayerCuffed(src) || Hospital.isDown(src)) {
    Notifications.add(src, 'Je kan dit momenteel niet', 'error');
    return;
  }

  const timeout = getPoliceConfig().config.carryTimeout;
  const closestPlayer = await RPC.execute<number>('police:interactions:getCarryTarget', src, timeout);
  if (!closestPlayer) return;

  if (
    isPlayerInActiveInteraction(src) ||
    isPlayerInActiveInteraction(closestPlayer) ||
    isPlayerCuffed(src) ||
    Hospital.isDown(src)
  )
    return;

  carryDuos.push({ carrier: src, target: closestPlayer });
  Events.emitNet('police:interactions:carryPlayer', src);
  Events.emitNet('police:interactions:getCarried', closestPlayer, src);

  Util.Log(
    'police:interactions:carry',
    { target: closestPlayer, distance: Util.getDistanceToPlayer(src, closestPlayer) },
    `${Util.getName(src)}(${src}) started carrying ${Util.getName(closestPlayer)}(${closestPlayer})}`,
    src
  );
});

Events.onNet('police:interactions:stopCarryDuo', (src: number) => {
  stopCarryDuo(src);
});

/**
 * Get serverId of player who is being carried by provided player
 */
export const getPlayerBeingCarried = (plyId: number) => {
  return carryDuos.find(duo => duo.carrier === plyId)?.target;
};

/**
 * Get serverId of player who is carrying provided player
 */
export const getPlayerCarrying = (plyId: number) => {
  return carryDuos.find(duo => duo.target === plyId)?.carrier;
};

export const isPlayerBeingCarried = (plyId: number) => {
  return !!getPlayerCarrying(plyId);
};

export const isPlayerCarrying = (plyId: number) => {
  return !!getPlayerBeingCarried(plyId);
};

export const isPlayerInCarryDuo = (plyId: number) => {
  return isPlayerCarrying(plyId) || isPlayerBeingCarried(plyId);
};

export const stopCarryDuo = (plyId: number) => {
  for (let i = 0; i < carryDuos.length; i++) {
    const { carrier, target } = carryDuos[i];
    if (carrier !== plyId && target !== plyId) continue;

    carryDuos.splice(i, 1);
    const carrierPed = GetPlayerPed(String(carrier));
    const targetPed = GetPlayerPed(String(target));

    const coords = Util.getOffsetFromPlayer(carrier, { x: 1.5, y: 0, z: -0.9 });

    setImmediate(() => {
      ClearPedTasksImmediately(carrierPed);
      ClearPedTasksImmediately(targetPed);
    });

    SetEntityCoords(targetPed, coords.x, coords.y, coords.z, false, false, false, false);
    break;
  }
};

global.exports('getPlayerBeingCarried', getPlayerBeingCarried);
