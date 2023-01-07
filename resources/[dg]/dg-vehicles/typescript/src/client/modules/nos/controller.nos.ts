import { Events, HUD, Keys, Notifications } from '@dgx/client';
import { Util } from '@dgx/shared';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

import { getNosConfig } from './config.nos';
import {
  cycleFlowrate,
  doesVehicleHaveNos,
  getNosAmountForHud,
  purge,
  startUsingNos,
  stopPurge,
  stopUsingNos,
  updateVehicleNosAmount,
} from './service.nos';

// Falling Edge
let keyReleaseTime: number | null = null;

HUD.addEntry('nos-amount', 'fire-flame', '#6D0680', () => getNosAmountForHud(), 3, 100, false);

Keys.register('useNos', 'Gebruik NOS (+mod for purge)', 'LMENU');
Keys.onPress('useNos', isDown => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver() || !doesVehicleHaveNos(veh)) return;

  // Handle key release
  if (!isDown) {
    if (keyReleaseTime === null) {
      keyReleaseTime = GetGameTimer();
    }

    stopUsingNos(veh);
    stopPurge();
    return;
  }

  if (Keys.isModPressed()) {
    purge(veh);
    return;
  }

  if (!Util.debounce('nos-usage-key', 500)) return;
  if (keyReleaseTime !== null && keyReleaseTime + getNosConfig().useTimeout > GetGameTimer()) {
    Notifications.add('Pas op voor oververhitting!');
    return;
  }

  keyReleaseTime = null;
  startUsingNos(veh);
});

Keys.register('cycleFlowrate', 'Cycle NOS Flowrate');
Keys.onPressDown('cycleFlowrate', () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver() || !doesVehicleHaveNos(veh)) return;
  cycleFlowrate();
});

Events.onNet('vehicles:nos:update', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(vehicle)) return;
  updateVehicleNosAmount(vehicle);
});
