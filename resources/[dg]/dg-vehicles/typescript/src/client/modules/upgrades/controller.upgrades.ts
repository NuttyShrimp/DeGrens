import { Peek, Sync, Vehicles } from '@dgx/client';
import { checkIllegalTunes } from './service.upgrades';
import upgradesManager from './classes/manager.upgrades';

global.exports('getCosmeticUpgrades', (vehicle: number) => {
  return upgradesManager.get('cosmetic', vehicle);
});
global.exports('applyUpgrades', (vehicle: number, upgrades: Partial<Vehicles.Upgrades.Upgrades>) => {
  Sync.executeAction('vehicles:upgrades:apply', vehicle, upgrades);
});

Sync.registerActionHandler(
  'vehicles:upgrades:apply',
  (vehicle: number, upgrades: Partial<Vehicles.Upgrades.Upgrades>) => {
    upgradesManager.set(vehicle, upgrades);
  }
);

Peek.addGlobalEntry('vehicle', {
  options: [
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
        return Vehicles.isNearVehiclePlace(veh, 'bonnet', 2, true);
      },
    },
  ],
  // higher distance because dist to boot gets checked in canInteract
  // this prevents entry not being enabled because we use raycast hit coord on entity for distancecheck
  // which can scuff when moving around vehicle while keeping raycast center on vehicle
  distance: 10,
});
