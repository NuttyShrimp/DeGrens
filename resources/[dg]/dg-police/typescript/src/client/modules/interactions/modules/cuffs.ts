import { Notifications, Events, Weapons, Keys, Jobs, RPC, Util, Inventory, Minigames, Animations } from '@dgx/client';
import { ENABLED_KEYS_WHILE_CUFFED, ENABLED_KEYS_WHILE_SOFT_CUFFED } from '../constants.interactions';

let cuffSpeed = 10;
let cuffType: 'soft' | 'hard' | null = null;
let doingCuffAction = false;

let cuffAnimLoopId: number | null = null;

export const isCuffed = () => cuffType !== null;
global.exports('isCuffed', isCuffed);

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

RPC.register('police:interactions:getCuffed', async (coords: Vec4) => {
  const ped = PlayerPedId();
  SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
  SetEntityHeading(ped, coords.w);

  Inventory.close();
  await Util.loadAnimDict('mp_arrest_paired');
  TaskPlayAnim(ped, 'mp_arrest_paired', 'crook_p2_back_right', 3.0, 3.0, -1, 0, 0, false, false, false);
  RemoveAnimDict('mp_arrest_paired');

  await Util.Delay(750);

  const success = await Minigames.keygame(1, cuffSpeed, 10);
  if (success) {
    cuffSpeed = Math.min(30, cuffSpeed + 3);
    setTimeout(() => {
      cuffSpeed = Math.max(10, cuffSpeed - 3);
    }, 10 * 60 * 1000);
    ClearPedTasks(PlayerPedId());
    return false;
  }

  await Util.Delay(2000);

  setCuffType('hard');
  return true;
});

Events.onNet('police:interactions:setCuffState', (state: Police.CuffType | null) => {
  setCuffType(state);
});

const setCuffType = (state: Police.CuffType | null) => {
  if (cuffType === state) return;

  if (state === null) {
    if (cuffAnimLoopId !== null) {
      Animations.stopAnimLoop(cuffAnimLoopId);
      cuffAnimLoopId = null;
    }
    cuffType = null;
    return;
  }

  cuffType = state;
  Weapons.removeWeapon(undefined, true);

  const animLoop: AnimLoops.Anim = {
    animation: {
      dict: cuffType === 'hard' ? 'mp_arresting' : 'anim@move_m@prisoner_cuffed',
      name: 'idle',
      flag: 49,
    },
    weight: 50,
    disableAllControls: true,
    enabledControls: [...ENABLED_KEYS_WHILE_CUFFED, ...(cuffType === 'hard' ? [] : ENABLED_KEYS_WHILE_SOFT_CUFFED)],
  };

  if (cuffAnimLoopId === null) {
    cuffAnimLoopId = Animations.startAnimLoop(animLoop);
  } else {
    Animations.modifyAnimLoop(cuffAnimLoopId, animLoop);
  }
};
