import { HUD, Keys, Statebags } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

import {
  getHarnessUses,
  isHarnessOn,
  isSeatbeltOn,
  justEjected,
  setHarnessUses,
  toggleSeatbelt,
} from './service.seatbelts';

HUD.addEntry('harness-uses', 'user-slash', '#11A156', () => getHarnessUses() / 10, 3, 100, false);

Keys.register('toggleseatbelt', 'Toggle Seatbelt', 'G');
Keys.onPressDown('toggleseatbelt', () => {
  toggleSeatbelt();
});

Statebags.addCurrentVehicleStatebagChangeHandler<number>('harnessUses', (vehicle, value) => {
  if (value > 0 && getHarnessUses() === 0) {
    HUD.toggleEntry('harness-uses', true);
  }
  setHarnessUses(value);
});

global.exports('isSeatbeltOn', isSeatbeltOn);
global.exports('isHarnessOn', isHarnessOn);
global.exports('justEjected', justEjected);
