import { Events, RPC } from '@dgx/client';
import { Util } from '@dgx/shared';
import { getCurrentVehicle } from '@helpers/vehicle';

import {
  applyUpgrades,
  getCosmeticUpgradePossibilities,
  getCosmeticUpgrades,
  getPerformanceUpgradePossibilities,
} from './service.upgrades';

global.exports('getCosmeticUpgrades', getCosmeticUpgrades);

RPC.register('vehicles:upgrades:getCosmetic', (vehNetId?: number) => {
  const veh = vehNetId !== undefined ? NetworkGetEntityFromNetworkId(vehNetId) : getCurrentVehicle();
  if (!veh) return;
  return getCosmeticUpgrades(veh);
});

Events.onNet('vehicles:upgrades:apply', async (vehNetId: number, upgrades: Partial<Upgrades.All>) => {
  // Vehicle handles gets changed sometimes for no fucking apparent reason when just spawned, check netid
  const exists = await Util.awaitEntityExistence(vehNetId, true);
  if (!exists) return;
  applyUpgrades(NetworkGetEntityFromNetworkId(vehNetId), upgrades);
});

RPC.register('vehicles:upgrades:getAllUpgradePossibilities', (vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh) return;
  const perfUpgrades = getPerformanceUpgradePossibilities(veh);
  const cosmUpgrades = getCosmeticUpgradePossibilities(veh);
  return {
    ...perfUpgrades,
    ...cosmUpgrades,
  };
});
