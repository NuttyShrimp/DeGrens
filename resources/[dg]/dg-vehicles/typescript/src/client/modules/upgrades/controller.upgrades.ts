import { Events, Peek, RPC, Util } from '@dgx/client';
import { getCurrentVehicle, isCloseToHood } from '@helpers/vehicle';

import {
  applyUpgrades,
  checkIllegalTunes,
  getCosmeticUpgradePossibilities,
  getCosmeticUpgrades,
  getPerformanceUpgradePossibilities,
  getPerformanceUpgrades,
} from './service.upgrades';
import { hasVehicleKeys } from 'modules/keys/cache.keys';

global.exports('getCosmeticUpgrades', getCosmeticUpgrades);

RPC.register('vehicles:upgrades:getCosmetic', async (vehNetId?: number) => {
  let veh = getCurrentVehicle();
  if (vehNetId) {
    const exists = await Util.awaitEntityExistence(vehNetId, true);
    if (!exists) return;
    veh = NetworkGetEntityFromNetworkId(vehNetId);
  }
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

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Plaats Neon',
      icon: 'fas fa-lightbulb',
      items: 'neon_strip',
      action: (_, entity) => {
        if (!entity) return;
        Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'neon');
      },
      canInteract: veh => {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        return hasVehicleKeys(veh);
      },
    },
    {
      label: 'Installeer Xenon',
      icon: 'fas fa-lightbulb',
      items: 'xenon_lights',
      action: (_, entity) => {
        if (!entity) return;
        Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'xenon');
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return isCloseToHood(ent, 2) && hasVehicleKeys(ent);
      },
    },
    {
      label: 'Controlleer Tuning',
      icon: 'fas fa-magnifying-glass',
      job: 'police',
      action: (_, entity) => {
        if (!entity) return;
        checkIllegalTunes(entity);
      },
      canInteract: veh => {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        return isCloseToHood(veh, 2, true);
      },
    },
  ],
  distance: 2,
});

RegisterCommand(
  'checkTunes',
  () => {
    const veh = GetVehiclePedIsIn(PlayerPedId(), false);
    if (!veh) return;
    const tunes = getPerformanceUpgrades(veh);
    if (!tunes) return;
    console.log(tunes);
  },
  false
);
