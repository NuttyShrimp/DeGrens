import { RPC, Events, Notifications, Util } from '@dgx/client';
import { DISABLED_KEYS_WHILE_ESCORTING } from '../constants.interactions';

let isEscorting = false;

export const getIsEscorting = () => isEscorting;

const getPlayerToEscort = async () => {
  const closestPly = Util.getClosestPlayerInDistanceAndOutsideVehicle(2);
  if (!closestPly) return;
  const target = GetPlayerServerId(closestPly);
  const canEscort = await RPC.execute<boolean>('police:interactions:canEscortPlayer', target);
  return canEscort ? target : undefined;
};

// Radialmenu option
on('police:startEscorting', async () => {
  const target = await getPlayerToEscort();
  if (!target) {
    Notifications.add('Er is niemand in de buurt', 'error');
    return;
  }

  Events.emitNet('police:interactions:escort', target);

  isEscorting = true;
  const thread = setInterval(() => {
    if (!isEscorting) {
      clearInterval(thread);
      return;
    }
    DISABLED_KEYS_WHILE_ESCORTING.forEach(key => DisableControlAction(0, key, true));
  }, 1);
});

// Radialmenu option
on('police:stopEscorting', async () => {
  Events.emitNet('police:interactions:stopEscort');
  isEscorting = false;
});

Events.onNet('police:interactions:overrideStoppedEscort', () => {
  isEscorting = false;
});

Events.onNet('police:interactions:getEscorted', (origin: number) => {
  const ped = PlayerPedId();
  DetachEntity(ped, true, false);
  const originPed = GetPlayerPed(GetPlayerFromServerId(origin));
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(originPed, 0.0, 0.45, 0.0));
  SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
  AttachEntityToEntity(ped, originPed, 11816, 0.45, 0.45, 0.0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
});

Events.onNet('police:interactions:detachEscorted', () => {
  const ped = PlayerPedId();
  DetachEntity(ped, true, false);
});

global.exports('isEscorting', () => isEscorting);
global.asyncExports('getPlayerToEscort', getPlayerToEscort);
