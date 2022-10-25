import { Config, Events, Financials, Inventory, RPC } from '@dgx/server';
import { getVinForNetId } from 'helpers/vehicle';

import { applyWaxItem, cleanVehicle } from './service.carwash';

Events.onNet('vehicles:carwash:clean', (plyId: number, netId: number) => {
  cleanVehicle(netId);
});

RPC.register('vehicles:carwash:payForCarwash', (plyId: number) => {
  const amount = Config.getConfigValue('vehicles.config')?.carwashPrice ?? 0;
  const removed = Financials.removeCash(plyId, amount, 'carwash-payment');
  return removed;
});

Inventory.registerUseable('cleaning_kit', plyId => {
  Events.emitNet('vehicles:carwash:useKit', plyId);
});

Inventory.registerUseable('vehicle_wax', plyId => {
  Events.emitNet('vehicles:carwash:useWax', plyId);
});

Events.onNet('vehicles:carwash:applyUsedWax', (plyId: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  applyWaxItem(plyId, vin);
});
