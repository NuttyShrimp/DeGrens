import { Peek, Vehicles } from '@dgx/client';
import { startLootingBanktruck, startHackingBanktruck } from './service.banktruck';

Peek.addFlagEntry('banktruckAction', {
  options: [
    {
      label: 'Openen',
      icon: 'fas fa-truck',
      action: (_, vehicle) => {
        if (!vehicle || !DoesEntityExist(vehicle)) return;
        startHackingBanktruck(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !DoesEntityExist(vehicle)) return false;
        if (!Vehicles.isNearVehiclePlace(vehicle, 'back', 2)) return false;
        return Entity(vehicle).state.banktruckAction === 'closed';
      },
    },
    {
      label: 'Beroven',
      icon: 'fas fa-truck',
      action: (_, vehicle) => {
        if (!vehicle || !DoesEntityExist(vehicle)) return;
        startLootingBanktruck(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !DoesEntityExist(vehicle)) return false;
        if (!Vehicles.isNearVehiclePlace(vehicle, 'back', 2)) return false;
        return Entity(vehicle).state.banktruckAction === 'opened';
      },
    },
  ],
  distance: 15,
});
