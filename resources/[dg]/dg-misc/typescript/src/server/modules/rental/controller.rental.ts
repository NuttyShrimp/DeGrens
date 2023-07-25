import { Config, Events, Inventory, Notifications, Vehicles } from '@dgx/server';

import { loadConfig, openRentList, rentVehicle } from './service.rental';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<Rentals.Config>('rentals');
  loadConfig(config);
});

Config.onModuleLoad<Rentals.Config>('rentals', config => {
  loadConfig(config);
});

Events.onNet('misc:rentals:openList', (src: number, locationId: string) => {
  openRentList(src, locationId);
});

Events.onNet('misc:rentals:rent', (src: number, data: { model: string; id: string; pay: 'cash' | 'bank' }) => {
  rentVehicle(src, data.model, data.id, data.pay);
});

Inventory.registerUseable<{ vin: string }>('rent_papers', (src, itemState) => {
  if (!itemState.metadata?.vin) return;
  const vehNetId = Vehicles.getNetIdOfVin(itemState.metadata.vin);
  if (!vehNetId) {
    Notifications.add(src, 'Da voertuig bestaat nie', 'error');
    return;
  }
  Vehicles.giveKeysToPlayer(src, vehNetId);
});
