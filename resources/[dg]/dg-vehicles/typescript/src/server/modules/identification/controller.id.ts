import { RPC } from '@dgx/server';
import { getVinForNetId } from 'helpers/vehicle';

import plateManager from './classes/platemanager';
import { getCidFromVin, isPlayerVehicleOwner } from './service.id';
import vinManager from './classes/vinmanager';

RPC.register('vehicles:isOwnerOfVehicle', async (plyId: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return false;
  return isPlayerVehicleOwner(plyId, vin);
});

global.exports('generatePlate', () => plateManager.generatePlate());
global.exports('isPlayerPlate', (plate: string) => plateManager.isPlayerPlate(plate));

RPC.register('vehicles:validateNewVehicle', (src, netId: number) => {
  return getVinForNetId(netId);
});

global.exports('generateVin', () => vinManager.generateVin());
global.asyncExports('getCidFromVin', getCidFromVin);
