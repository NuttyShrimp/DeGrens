import { HUD, Keys, Notifications } from '@dgx/client';
import { Util } from '@dgx/shared';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

import { getNosConfig } from './config.nos';
import {
  cycleFlowrate,
  doesVehicleHaveNos,
  getNosAmountForHud,
  isUsingNos,
  purge,
  setHudDisplayAmount,
  startUsingNos,
  stopPurge,
  stopUsingNos,
} from './service.nos';

// Falling Edge
let keyReleaseTime: number | null = null;

HUD.addEntry('nos-amount', 'fire-flame', '#6D0680', () => getNosAmountForHud(), 3, 100, false);

Keys.register('useNos', 'Gebruik NOS (+mod for purge)', 'LMENU');
Keys.onPress('useNos', isDown => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver() || !doesVehicleHaveNos(veh)) return;
  if (isDown) {
    if (Keys.isModPressed()) {
      purge(veh);
    } else {
      if (!Util.debounce('nos-usage-key', 500)) return;
      if (keyReleaseTime !== null && keyReleaseTime + getNosConfig().useTimeout > GetGameTimer()) {
        Notifications.add('Pas op voor oververhitting!');
        return;
      }
      keyReleaseTime = null;

      startUsingNos(veh);
    }
  } else {
    if (keyReleaseTime === null) {
      keyReleaseTime = GetGameTimer();
    }

    stopUsingNos(veh);
    stopPurge();
  }
});

Keys.register('cycleFlowrate', 'Cycle NOS Flowrate');
Keys.onPressDown('cycleFlowrate', () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver() || !doesVehicleHaveNos(veh)) return;
  cycleFlowrate();
});

global.exports('isUsingNos', isUsingNos);

//@ts-ignore
AddStateBagChangeHandler('nos', null, (bagName: string, _, value: number) => {
  if (!bagName.startsWith('entity:')) return;
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (getCurrentVehicle() !== veh) return;
  setHudDisplayAmount(value);
});
