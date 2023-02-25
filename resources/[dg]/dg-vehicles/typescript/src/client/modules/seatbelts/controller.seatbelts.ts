import { HUD, Keys } from '@dgx/client';
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

//@ts-ignore
AddStateBagChangeHandler('harnessUses', null, (bagName: string, _, value: number) => {
  if (!bagName.startsWith('entity:')) return;
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;

  // handler fires before entity exists for client. This handler is used for current vehicle only so we dont need to await
  if (!NetworkDoesNetworkIdExist(netId) || !NetworkDoesEntityExistWithNetworkId(netId)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (getCurrentVehicle() !== veh) return;

  if (value > 0 && getHarnessUses() === 0) {
    HUD.toggleEntry('harness-uses', true);
  }
  setHarnessUses(value);
});

global.exports('isSeatbeltOn', isSeatbeltOn);
global.exports('isHarnessOn', isHarnessOn);
global.exports('justEjected', justEjected);
