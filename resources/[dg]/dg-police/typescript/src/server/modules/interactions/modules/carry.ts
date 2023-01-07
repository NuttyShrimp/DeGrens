import { Hospital, Notifications, Events, Chat, Util } from '@dgx/server';
import { isPlayerInActiveInteraction } from '../service.interactions';
import { getPoliceConfig } from 'services/config';
import { isPlayerCuffed } from './cuffs';

const carryDuos: { carrier: number; target: number }[] = [];

Chat.registerCommand('carry', 'Neem een persoon op je schouder', [], 'user', src => {
  if (isPlayerCuffed(src) || Hospital.isDown(src)) {
    Notifications.add(src, 'Je kan dit momenteel niet', 'error');
    return;
  }

  const closestPlayerAtStart = Util.getClosestPlayerOutsideVehicle(src, 1.5);
  if (!closestPlayerAtStart) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const timeout = getPoliceConfig().config.carryTimeout;
  setTimeout(() => {
    const closestPlayer = Util.getClosestPlayerOutsideVehicle(src, 2);
    if (closestPlayer !== closestPlayerAtStart) return;

    if (isPlayerInActiveInteraction(src) || isPlayerInActiveInteraction(closestPlayer)) return;

    carryDuos.push({ carrier: src, target: closestPlayer });
    Events.emitNet('police:interactions:carryPlayer', src);
    Events.emitNet('police:interactions:getCarried', closestPlayer, src);

    Util.Log('police:interactions:carry', { target: closestPlayer }, `${Util.getName(src)} has carried a player`, src);
  }, timeout);
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

export const isPlayerInCarryDuo = (plyId: number) => {
  return carryDuos.find(duo => duo.carrier === plyId || duo.target === plyId) !== undefined;
};

export const stopCarryDuo = (plyId: number) => {
  for (let i = 0; i < carryDuos.length; i++) {
    const { carrier, target } = carryDuos[i];
    if (carrier !== plyId && target !== plyId) continue;

    carryDuos.splice(i, 1);
    const carrierPed = GetPlayerPed(String(carrier));
    const targetPed = GetPlayerPed(String(target));

    const coords = Util.getOffsetFromPlayer(carrier, { x: 1, y: 0, z: -0.9 });

    setImmediate(() => {
      ClearPedTasksImmediately(carrierPed);
      ClearPedTasksImmediately(targetPed);
    });

    SetEntityCoords(targetPed, coords.x, coords.y, coords.z, false, false, false, false);
    break;
  }
};
