import { Events, RPC, Taskbar, Inventory, Util, Notifications, Minigames, Weapons } from '@dgx/client';
import {
  DISABLED_KEYS_WHILE_ESCORTING,
  ENABLED_KEYS_WHILE_CUFFED,
  ENABLED_KEYS_WHILE_SOFT_CUFFED,
} from './constants.interactions';
import { getClosestSeatId } from './helpers.interactions';

let cuffSpeed = 10;
let cuffThread: NodeJS.Timer | null = null;
let cuffType: 'soft' | 'hard' | null = null;
let cuffAnimPaused = false;
let doingCuffAction = false;

let isEscorting = false;

export const isCuffed = () => cuffType !== null;

export const getIsEscorting = () => isEscorting;
export const setIsEscorting = (val: boolean) => {
  isEscorting = val;
};

export const takeOutVehicle = async (vehicle: number) => {
  const [canceled] = await Taskbar.create('right-from-bracket', 'Uithalen', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    disarm: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
  });
  if (canceled) return;

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const amountOfSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  const closestSeat = getClosestSeatId(vehicle);
  Events.emitNet('police:interactions:takeOutVehicle', netId, amountOfSeats, closestSeat);
};

export const putInVehicle = async (vehicle: number) => {
  const [canceled] = await Taskbar.create('right-to-bracket', 'Insteken', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    disarm: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
  });
  if (canceled) return;

  if (isEscorting) {
    stopEscorting();
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const closestSeat = getClosestSeatId(vehicle);
  const amountOfSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  Events.emitNet('police:interactions:putInVehicle', netId, amountOfSeats, closestSeat);
};

export const getPlayerToRob = async () => {
  if (!Util.isAnyPlayerCloseAndOutsideVehicle()) return;
  const data = await RPC.execute<{ player: number; canRob: boolean }>('police:interactions:getPlayerToRob');
  if (!data) return;
  const plyId = GetPlayerFromServerId(data.player);
  const hasHandsUp = IsEntityPlayingAnim(GetPlayerPed(plyId), 'missminuteman_1ig_2', 'handsup_base', 3);
  if (!data.canRob && !hasHandsUp) return;
  return data.player;
};

export const robPlayer = async () => {
  const [canceled] = await Taskbar.create('people-robbery', 'Beroven', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
    animation: {
      animDict: 'random@shop_robbery',
      anim: 'robbery_action_b',
      flags: 16,
    },
  });
  if (canceled) return;

  const target = await getPlayerToRob();
  if (!target) return;
  Inventory.openOtherPlayer(target);
  Events.emitNet('police:interactions:robbedPlayer', target);
};

export const tryToCuff = () => {
  if (doingCuffAction) return;

  const canDo = Util.debounce('try-to-cuff', 1000);
  if (!canDo) return;
  if (!Util.isAnyPlayerCloseAndOutsideVehicle(1)) {
    Notifications.add('Er is niemand in de buurt', 'error');
    return;
  }
  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, true)) {
    Notifications.add('Je kan dit niet vanuit een voertuig', 'error');
    return;
  }
  if (GetEntitySpeed(PlayerPedId()) * 3.6 > 3) {
    Notifications.add('Je kan dit niet als je beweegt', 'error');
    return;
  }
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0, 0.5, 0));
  Events.emitNet('police:interactions:tryToCuff', coords);

  doingCuffAction = true;
  setTimeout(() => {
    doingCuffAction = false;
  }, 5000);
};

export const getCuffed = async () => {
  const success = await Minigames.keygame(1, cuffSpeed, 10);
  if (success) {
    cuffSpeed = Math.min(20, cuffSpeed + 2);
    setTimeout(() => {
      cuffSpeed = Math.max(10, cuffSpeed - 2);
    }, 10 * 60 * 1000);
    ClearPedTasks(PlayerPedId());
    return;
  }

  await Util.Delay(2000);

  cuffType = 'hard';
  Events.emitNet('police:interactions:setCuffState', cuffType);

  await Util.loadAnimDict('mp_arresting');
  await Util.loadAnimDict('anim@move_m@prisoner_cuffed');
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);
  Weapons.removeWeapon(undefined, true);
  cuffThread = setInterval(() => {
    const ped = PlayerPedId();
    DisableAllControlActions(0);
    ENABLED_KEYS_WHILE_CUFFED.forEach(key => EnableControlAction(0, key, true));

    if (cuffType === 'soft') {
      ENABLED_KEYS_WHILE_SOFT_CUFFED.forEach(key => EnableControlAction(0, key, true));
    }

    if (cuffAnimPaused) return;
    const animDict = cuffType === 'hard' ? 'mp_arresting' : 'anim@move_m@prisoner_cuffed';
    if (!IsEntityPlayingAnim(ped, animDict, 'idle', 3)) {
      TaskPlayAnim(ped, animDict, 'idle', 8, -8, -1, 49, 0, false, false, false);
    }
  }, 1);
};

export const changeCuffType = () => {
  if (cuffType === 'hard') {
    cuffType = 'soft';
    Events.emitNet('police:interactions:setCuffState', cuffType);
    return;
  }

  if (cuffType === 'soft') {
    cuffType = null;
    Events.emitNet('police:interactions:setCuffState', cuffType);
    if (cuffThread !== null) {
      clearInterval(cuffThread);
      ClearPedTasks(PlayerPedId());
      global.exports['dg-lib'].shouldExecuteKeyMaps(true);
      cuffThread = null;
    }
  }
};

export const pauseCuffAnimation = (pause: boolean) => {
  cuffAnimPaused = pause;
  if (cuffAnimPaused) {
    const animDict = cuffType === 'hard' ? 'mp_arresting' : 'anim@move_m@prisoner_cuffed';
    StopAnimTask(PlayerPedId(), animDict, 'idle', 1);
  }
};

export const getPlayerToEscort = async () => {
  const player = await RPC.execute<number | undefined>('police:interactions:getPlyToEscort');
  if (!player) return;
  return player;
};

export const startEscorting = (target: number) => {
  Events.emitNet('police:interactions:escort', target);
  setIsEscorting(true);

  const thread = setInterval(() => {
    if (!isEscorting) {
      clearInterval(thread);
      return;
    }
    DISABLED_KEYS_WHILE_ESCORTING.forEach(key => DisableControlAction(0, key, true));
  }, 1);
};

export const stopEscorting = () => {
  Events.emitNet('police:interactions:stopEscort');
  setIsEscorting(false);
};

export const startGettingEscorted = (origin: number) => {
  const ped = PlayerPedId();
  DetachEntity(ped, true, false);
  const originPed = GetPlayerPed(GetPlayerFromServerId(origin));
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(originPed, 0.0, 0.45, 0.0));
  SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
  AttachEntityToEntity(ped, originPed, 11816, 0.45, 0.45, 0.0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
};

export const stopGettingEscorted = () => {
  const ped = PlayerPedId();
  DetachEntity(ped, true, false);
};
