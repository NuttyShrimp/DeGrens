import { Events, Inventory, Jobs, Keys, Notifications, Peek, RPC, Util } from '@dgx/client';
import { isAnyPlayerInVehicle } from './helpers.interactions';
import {
  changeCuffType,
  getCuffed,
  startGettingEscorted,
  getIsEscorting,
  getPlayerToRob,
  isCuffed,
  pauseCuffAnimation,
  putInVehicle,
  robPlayer,
  setIsEscorting,
  stopGettingEscorted,
  stopEscorting,
  takeOutVehicle,
  tryToCuff,
  startEscorting,
  getPlayerToEscort,
} from './service.interactions';

global.exports('isCuffed', isCuffed);
global.exports('pauseCuffAnimation', pauseCuffAnimation);
global.exports('isEscorting', getIsEscorting);

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Haal uit voertuig',
      icon: 'fas fa-right-from-bracket',
      action: (_, vehicle) => {
        if (!vehicle) return;
        takeOutVehicle(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), true)) return false;
        return isAnyPlayerInVehicle(vehicle);
      },
    },
    {
      label: 'Steek in voertuig',
      icon: 'fas fa-right-to-bracket',
      action: (_, vehicle) => {
        if (!vehicle) return;
        putInVehicle(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), true)) return false;
        if (!AreAnyVehicleSeatsFree(vehicle)) return false;
        return Util.isAnyPlayerCloseAndOutsideVehicle();
      },
    },
  ],
});

global.asyncExports('getPlayerToRob', getPlayerToRob);

on('police:robPlayer', () => {
  robPlayer();
});

Events.onNet('police:interactions:searchPlayer', (plyId: number) => {
  Inventory.openOtherPlayer(plyId);
});

on('police:tryToCuff', () => {
  tryToCuff();
});

Keys.register('handcuff', '(police) Handboeien', 'UP');
Keys.onPressDown('handcuff', () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  tryToCuff();
});

Events.onNet('police:interactions:doCuff', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('mp_arrest_paired');
  TaskPlayAnim(ped, 'mp_arrest_paired', 'cop_p2_back_right', 3.0, 3.0, -1, 17, 0, false, false, false);
  await Util.Delay(3500);
  TaskPlayAnim(ped, 'mp_arrest_paired', 'exit', 3.0, 3.0, -1, 17, 0, false, false, false);
  RemoveAnimDict('mp_arrest_paired');
});

RPC.register('police:interactions:doUncuff', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('mp_arresting');
  TaskPlayAnim(ped, 'mp_arresting', 'a_uncuff', 3.0, 3.0, -1, 17, 0, false, false, false);
  await Util.Delay(4500);
  //@ts-ignore Return type is false or 1
  const result = IsEntityPlayingAnim(ped, 'mp_arresting', 'a_uncuff', 3) === 1;
  RemoveAnimDict('mp_arresting');
  ClearPedTasks(ped);
  return result;
});

Events.onNet('police:interactions:getCuffed', async () => {
  Inventory.close();
  const ped = PlayerPedId();
  await Util.loadAnimDict('mp_arrest_paired');
  TaskPlayAnim(ped, 'mp_arrest_paired', 'crook_p2_back_right', 3.0, 3.0, -1, 0, 0, false, false, false);
  RemoveAnimDict('mp_arrest_paired');

  setTimeout(() => {
    getCuffed();
  }, 750);
});

Events.onNet('police:interactions:getUncuffed', () => {
  changeCuffType();
});

global.asyncExports('getPlayerToEscort', getPlayerToEscort);

on('police:startEscorting', async () => {
  const player = await getPlayerToEscort();
  if (!player) {
    Notifications.add('Er is niemand in de buurt', 'error');
    return;
  }

  startEscorting(player);
});

on('police:stopEscorting', async () => {
  stopEscorting();
});

Events.onNet('police:interactions:stopEscorting', () => {
  stopEscorting();
});

Events.onNet('police:interactions:getEscorted', (origin: number) => {
  startGettingEscorted(origin);
});

Events.onNet('police:interactions:detachEscorted', () => {
  stopGettingEscorted();
});

Events.onNet('police:interactions:carryPlayer', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('missfinale_c2mcs_1');
  TaskPlayAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3.0, -2.0, -1, 49, 0, false, false, false);
  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3));
  const tick = setTick(() => {
    if (IsControlJustPressed(0, 73)) {
      ClearPedTasks(ped);
    }
    if (!IsEntityPlayingAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3)) {
      RemoveAnimDict('missfinale_c2mcs_1');
      const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 1, 0, 0));
      Events.emitNet('police:interactions:stopCarrying', coords);
      ClearPedTasks(ped);
      clearTick(tick);
    }
  });
});

Events.onNet('police:interactions:getCarried', async (plyId: number) => {
  const ped = PlayerPedId();
  const draggerPed = GetPlayerPed(GetPlayerFromServerId(plyId));
  await Util.loadAnimDict('nm');
  AttachEntityToEntity(ped, draggerPed, 0, 0.27, 0.15, 0.63, 0.5, 0.5, 0.0, false, false, false, false, 2, false);
  TaskPlayAnim(ped, 'nm', 'firemans_carry', 8.0, -8.0, -1, 33, 0, false, false, false);
  pauseCuffAnimation(true);

  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'nm', 'firemans_carry', 3));
  const tick = setTick(() => {
    if (IsControlJustPressed(0, 73)) {
      ClearPedTasks(ped);
    }
    if (!IsEntityPlayingAnim(ped, 'nm', 'firemans_carry', 3)) {
      DetachEntity(ped, true, false);
      RemoveAnimDict('nm');
      const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(draggerPed, 1, 0, 0));
      Events.emitNet('police:interactions:stopCarrying', coords);
      ClearPedTasks(ped);
      clearTick(tick);
      pauseCuffAnimation(false);
    }
  });
});

Events.onNet('police:interactions:stopCarry', () => {
  ClearPedTasks(PlayerPedId());
});
