import { Auth, Events, Inventory, Notifications, Vehicles } from '@dgx/server';

import { getLocations, loadConfig, openRentList, rentVehicle } from './service.rental';

setImmediate(() => {
  loadConfig();
});

Auth.onAuth(plyId => {
  Events.emitNet('misc:rentals:loadLocations', plyId, getLocations());
});

on('dg-config:moduleLoaded', async (name: string) => {
  if (name !== 'rentals') return;
  await loadConfig();
  Events.emitNet('misc:rentals:loadLocations', -1, getLocations());
});

Events.onNet('misc:rentals:openList', (src: number, locationId: string) => {
  openRentList(src, locationId);
});

Events.onNet('misc:rentals:rent', (src: number, data: { model: string; id: string; pay: 'cash' | 'bank' }) => {
  rentVehicle(src, data.model, data.id, data.pay);
});

Inventory.registerUseable('rent_papers', (src, itemState) => {
  if (!itemState.metadata?.vin) return;
  const vehNetId = Vehicles.getNetIdOfVin(itemState.metadata.vin);
  if (!vehNetId) {
    Notifications.add(src, 'Da voertuig bestaat nie', 'error');
    return;
  }
  Vehicles.giveKeysToPlayer(src, vehNetId);
});
