import { Events, Hospital, Keys, Police, Util } from '@dgx/client';
import { DISABLED_KEYS_WHILE_ESCORTING } from '../constants.interactions';
import { pauseCuffAnimation } from './cuffs';

let cancelCarry = false;

Keys.onPressDown('cancelEmote', () => {
  cancelCarry = true;
});

Events.onNet('police:interactions:carryPlayer', async () => {
  const ped = PlayerPedId();

  // Initiate animation and wait till started
  await Util.loadAnimDict('missfinale_c2mcs_1');
  TaskPlayAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3.0, -2.0, -1, 49, 0, false, false, false);
  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 3));

  // Check loop
  cancelCarry = false;
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
    }
  }, 1);
});

Events.onNet('police:interactions:getCarried', async (plyId: number) => {
  const ped = PlayerPedId();
  const draggerPed = GetPlayerPed(GetPlayerFromServerId(plyId));

  pauseCuffAnimation(true);
  Hospital.pauseDownAnimation(true);
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  // Initiate anim/attach and wait till started
  await Util.loadAnimDict('nm');
  AttachEntityToEntity(ped, draggerPed, 0, 0.27, 0.15, 0.63, 0.5, 0.5, 0.0, false, false, false, false, 2, false);
  TaskPlayAnim(ped, 'nm', 'firemans_carry', 8.0, -8.0, -1, 33, 0, false, false, false);
  await Util.awaitCondition(() => IsEntityPlayingAnim(ped, 'nm', 'firemans_carry', 3));

  // Check loop
  cancelCarry = false;
  const thread = setInterval(() => {
    DisableAllControlActions(0);

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

      pauseCuffAnimation(false);
      Hospital.pauseDownAnimation(false);
      global.exports['dg-lib'].shouldExecuteKeyMaps(true);
    }
  }, 1);
});
