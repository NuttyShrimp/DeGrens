import { Events, RPC } from '@dgx/server';
import { getVinForNetId } from 'helpers/vehicle';

import { fuelManager } from './classes/fuelManager';
import { getFuelPrice, payRefuel } from './service.fuel';

RPC.register('vehicle:fuel:getByNetId', (src: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  return fuelManager.getFuelLevel(vin);
});

Events.onNet('vehicle:fuel:updateForNetId', (src: number, netId: number, fuel: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  fuelManager.setFuelLevel(vin, fuel);
});

Events.onNet('vehicles:fuel:payRefuel', (src, vin: string) => {
  payRefuel(src, vin);
});

RPC.register('vehicles:fuel:getPrice', (src, vin: string) => {
  return getFuelPrice(vin);
});
