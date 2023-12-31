import { Animations, Events, Hospital, Keys, Police, RPC, Util, Notifications } from '@dgx/client';
import { DISABLED_KEYS_WHILE_ESCORTING, VOICECHAT_KEYS } from '../constants.interactions';

let gettingCarried = false;
let carrying = false;

let cancelCarry = false;

Keys.onPressDown(
  'cancelEmote',
  () => {
    cancelCarry = true;
  },
  true
);

RPC.register('police:interactions:getCarryTarget', async (timeout: number) => {
  const closestPlayerAtStart = Util.getClosestPlayer({ range: 1.5, skipInVehicle: true });
  if (!closestPlayerAtStart) {
    Notifications.add('Er is niemand in de buurt', 'error');
    return;
  }

  await Util.Delay(timeout);

  const closestPlayer = Util.getClosestPlayer({ range: 2, skipInVehicle: true });
  if (!closestPlayer) return;

  return GetPlayerServerId(closestPlayer);
});

Events.onNet('police:interactions:carryPlayer', async () => {
  const ped = PlayerPedId();

  // Initiate animation and wait till started
  await Util.loadAnimDict('missfinale_c2mcs_1');
  TaskPlayAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3.0, -2.0, -1, 49, 0, false, false, false);
  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3));

  // NOTE: Not using AnimLoops here because we want to do action when anim stops
  Animations.pauseAnimLoopAnimations(true);

  // Check loop
  cancelCarry = false;
  carrying = true;

  const thread = setInterval(() => {
    DISABLED_KEYS_WHILE_ESCORTING.forEach(key => DisableControlAction(0, key, true));

    if (cancelCarry) {
      ClearPedTasksImmediately(ped);
      cancelCarry = false;
    }

    if (!IsEntityPlayingAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3)) {
      RemoveAnimDict('missfinale_c2mcs_1');
      Events.emitNet('police:interactions:stopCarryDuo');
      ClearPedTasksImmediately(ped);
      clearInterval(thread);
      Animations.pauseAnimLoopAnimations(false);

      carrying = false;
    }
  }, 1);
});

Events.onNet('police:interactions:getCarried', async (plyId: number) => {
  const ped = PlayerPedId();
  const draggerPed = GetPlayerPed(GetPlayerFromServerId(plyId));

  Animations.pauseAnimLoopAnimations(true);
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  // Initiate anim/attach and wait till started
  await Util.loadAnimDict('nm');
  AttachEntityToEntity(ped, draggerPed, 0, 0.27, 0.15, 0.63, 0.5, 0.5, 0.0, false, false, false, false, 2, false);
  TaskPlayAnim(ped, 'nm', 'firemans_carry', 8.0, -8.0, -1, 33, 0, false, false, false);
  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'nm', 'firemans_carry', 3));

  // Check loop
  cancelCarry = false;
  gettingCarried = true;

  const thread = setInterval(() => {
    DisableAllControlActions(0);
    VOICECHAT_KEYS.forEach(key => {
      EnableControlAction(0, key, true);
    });

    if (cancelCarry && !Police.isCuffed() && !Hospital.isDown()) {
      ClearPedTasksImmediately(ped);
      cancelCarry = false;
    }

    if (!IsEntityPlayingAnim(ped, 'nm', 'firemans_carry', 3)) {
      DetachEntity(ped, true, false);
      RemoveAnimDict('nm');
      Events.emitNet('police:interactions:stopCarryDuo');
      ClearPedTasksImmediately(ped);
      clearInterval(thread);

      Animations.pauseAnimLoopAnimations(false);
      global.exports['dg-lib'].shouldExecuteKeyMaps(true);

      gettingCarried = false;
    }
  }, 1);
});

export const isInCarryDuo = () => {
  return carrying || gettingCarried;
};
