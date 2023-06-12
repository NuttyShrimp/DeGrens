import { Peek, Events, Vehicles } from '@dgx/client';
import { hasVehicleKeys } from 'modules/keys/cache.keys';

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Vervang Nummerplaat',
      icon: 'fas fa-screwdriver',
      items: 'fakeplate',
      action: (_, vehicle) => {
        if (!vehicle) return;
        Events.emitNet('vehicles:fakeplate:install', NetworkGetNetworkIdFromEntity(vehicle));
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (!hasVehicleKeys(vehicle)) return false;
        if (doesVehicleHaveFakePlate(vehicle)) return false;
        return Vehicles.isNearVehiclePlace(vehicle, 'back', 2);
      },
    },
    {
      label: 'Verwijder Nummerplaat',
      icon: 'fas fa-screwdriver',
      action: (_, vehicle) => {
        if (!vehicle) return;
        Events.emitNet('vehicles:fakeplate:remove', NetworkGetNetworkIdFromEntity(vehicle));
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (!hasVehicleKeys(vehicle)) return false;
        if (!doesVehicleHaveFakePlate(vehicle)) return false;
        return Vehicles.isNearVehiclePlace(vehicle, 'back', 2);
      },
    },
  ],
  // higher distance because dist to boot gets checked in canInteract
  // this prevents entry not being enabled because we use raycast hit coord on entity for distancecheck
  // which can scuff when moving around vehicle while keeping raycast center on vehicle
  distance: 10,
});

export const doesVehicleHaveFakePlate = (vehicle: number) => {
  return Entity(vehicle).state?.isFakePlate ?? false;
};
