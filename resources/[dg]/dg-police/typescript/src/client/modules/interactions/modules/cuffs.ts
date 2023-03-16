import { Notifications, Events, Weapons, Keys, Jobs, RPC, Util, Inventory, Minigames } from '@dgx/client';
import { ENABLED_KEYS_WHILE_CUFFED, ENABLED_KEYS_WHILE_SOFT_CUFFED } from '../constants.interactions';

let cuffSpeed = 10;
let cuffType: 'soft' | 'hard' | null = null;
let cuffAnimPaused = false;
let doingCuffAction = false;

export const isCuffed = () => cuffType !== null;
global.exports('isCuffed', isCuffed);

export const pauseCuffAnimation = (pause: boolean) => {
  cuffAnimPaused = pause;
  if (cuffAnimPaused) {
    const animDict = cuffType === 'hard' ? 'mp_arresting' : 'anim@move_m@prisoner_cuffed';
    StopAnimTask(PlayerPedId(), animDict, 'idle', 1);
  }
};
global.exports('pauseCuffAnimation', pauseCuffAnimation);

const tryToCuff = () => {
  if (doingCuffAction) return;

  const canDo = Util.debounce('try-to-cuff', 1000);
  if (!canDo) return;

  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, true)) {
    Notifications.add('Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  if (GetEntitySpeed(ped) * 3.6 > 3) {
    Notifications.add('Je kan dit niet als je beweegt', 'error');
    return;
  }

  if (IsPedSwimming(ped) || IsPedDiving(ped) || IsPedSwimmingUnderWater(ped)) {
    Notifications.add('Je kan dit niet in het water', 'error');
    return;
  }

  const closestPly = Util.getClosestPlayerInDistanceAndOutsideVehicle(1);
  if (!closestPly) {
    Notifications.add('Er is niemand in de buurt', 'error');
    return;
  }

  const target = GetPlayerServerId(closestPly);
  Events.emitNet('police:interactions:tryToCuff', target);

  doingCuffAction = true;
  setTimeout(() => {
    doingCuffAction = false;
  }, 5000);
};

const cuff = async (canBreakOut = true) => {
  if (cuffType !== null) return;

  if (canBreakOut) {
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
  }

  cuffType = 'hard';
  Events.emitNet('police:interactions:setCuffState', cuffType);

  await Util.loadAnimDict('mp_arresting');
  await Util.loadAnimDict('anim@move_m@prisoner_cuffed');
  Weapons.removeWeapon(undefined, true);

  const cuffThread = setInterval(() => {
    const ped = PlayerPedId();
    const animDict = cuffType === 'hard' ? 'mp_arresting' : 'anim@move_m@prisoner_cuffed';

    if (cuffType === null) {
      clearInterval(cuffThread);
      StopAnimTask(ped, animDict, 'idle', 1);
      return;
    }

    if (!cuffAnimPaused) {
      if (!IsEntityPlayingAnim(ped, animDict, 'idle', 3)) {
        ClearPedTasks(ped);
        TaskPlayAnim(ped, animDict, 'idle', 8, -8, -1, 49, 0, false, false, false);
      }
    }

    DisableAllControlActions(0);
    ENABLED_KEYS_WHILE_CUFFED.forEach(key => EnableControlAction(0, key, true));
    if (cuffType === 'soft') {
      ENABLED_KEYS_WHILE_SOFT_CUFFED.forEach(key => EnableControlAction(0, key, true));
    }
  }, 1);
};

// Radialmenu option
on('police:tryToCuff', () => {
  tryToCuff();
});

Keys.register('handcuff', '(police) handboeien', 'UP');
Keys.onPressDown('handcuff', () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  if (isCuffed()) return;

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

RPC.register('police:interactions:doUncuff', async (targetServerId: number) => {
  const ped = PlayerPedId();
  const targetPed = GetPlayerPed(GetPlayerFromServerId(targetServerId));

  await Util.loadAnimDict('mp_arresting');
  TaskPlayAnim(ped, 'mp_arresting', 'a_uncuff', 3.0, 3.0, -1, 17, 0, false, false, false);
  RemoveAnimDict('mp_arresting');
  await Util.Delay(4500);

  const distanceBetweenPeds = Util.getEntityCoords(ped).distance(Util.getEntityCoords(targetPed));
  const stillPlayingAnim = !!IsEntityPlayingAnim(ped, 'mp_arresting', 'a_uncuff', 3);
  const success = stillPlayingAnim && distanceBetweenPeds < 5;

  ClearPedTasks(ped);

  return success;
});

Events.onNet('police:interactions:getCuffed', async (coords: Vec4) => {
  const ped = PlayerPedId();
  SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
  SetEntityHeading(ped, coords.w);

  Inventory.close();
  await Util.loadAnimDict('mp_arrest_paired');
  TaskPlayAnim(ped, 'mp_arrest_paired', 'crook_p2_back_right', 3.0, 3.0, -1, 0, 0, false, false, false);
  RemoveAnimDict('mp_arrest_paired');

  setTimeout(() => {
    cuff();
  }, 750);
});

Events.onNet('police:interactions:setCuffState', (state: Police.CuffType | null) => {
  cuffType = state;
});

Events.onNet('police:interactions:forceCuff', () => {
  cuff(false);
});
