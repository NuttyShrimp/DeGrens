import { Events, Notifications, Peek } from '@dgx/client';
import { getVehicleVin, getVehicleVinWithoutValidation } from './service.identification';
import { isCloseToBoot, isCloseToHood } from '@helpers/vehicle';
import { hasVehicleKeys } from 'modules/keys/cache.keys';

global.asyncExports('getVehicleVin', getVehicleVin);
global.exports('getVehicleVinWithoutValidation', getVehicleVinWithoutValidation);

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Vervang nummerplaat',
      icon: 'fas fa-screwdriver',
      items: 'fakeplate',
      action: (_, entity) => {
        if (!entity) return;
        Events.emitNet('vehicles:plate:useFakePlate', NetworkGetNetworkIdFromEntity(entity));
      },
      canInteract(veh) {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        if (!hasVehicleKeys(veh)) return false;
        const vehState = Entity(veh).state;
        if (vehState.fakePlate) return false;
        return isCloseToBoot(veh, 2);
      },
    },
    {
      label: 'Verwijder nummerplaat',
      icon: 'fas fa-screwdriver',
      action: (_, entity) => {
        if (!entity) return;
        Events.emitNet('vehicles:plate:removeFakePlate', NetworkGetNetworkIdFromEntity(entity));
      },
      canInteract(veh) {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        if (!hasVehicleKeys(veh)) return false;
        const vehState = Entity(veh).state;
        if (!vehState?.fakePlate) return false;
        return isCloseToBoot(veh, 2);
      },
    },
    {
      label: 'Lees VIN',
      icon: 'fas fa-barcode',
      action: async (_, entity) => {
        if (!entity) return;
        const vin = await getVehicleVin(entity);
        if (!vin) return;
        Notifications.add(`VIN: '${vin}'`, 'info');
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return isCloseToHood(ent, 2, true);
      },
    },
  ],
  // higher distance because dist to boot gets checked in canInteract
  // this prevents entry not being enabled because we use raycast hit coord on entity for distancecheck
  // which can scuff when moving around vehicle while keeping raycast center on vehicle
  distance: 10,
});
