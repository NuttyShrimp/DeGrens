import { Events, Inventory, Notifications, Vehicles } from '@dgx/server';

import { getLocations, loadConfig, openRentList, rentVehicle } from './service.rental';

setImmediate(() => {
  loadConfig();
});

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  Events.emitNet('misc:rentals:loadLocations', playerData.source, getLocations());
});

on('dg-config:moduleLoaded', (name: string) => {
  if (name !== 'rentals') return;
  loadConfig();
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
    Notifications.add(src, "Da voertuig bestaat nie", "error");
    return;
  }
  Vehicles.giveKeysToPlayer(src, vehNetId);
});
