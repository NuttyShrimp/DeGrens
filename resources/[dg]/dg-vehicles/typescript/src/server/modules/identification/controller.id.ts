import { Events, RPC } from '@dgx/server';
import { getVinForNetId } from 'helpers/vehicle';

import plateManager from './classes/platemanager';
import { applyFakePlateItem, isPlayerVehicleOwner, removeFakePlate } from './service.id';

Events.onNet('vehicles:plate:useFakePlate', (src: number, netId: number) => {
  applyFakePlateItem(src, netId);
});

Events.onNet('vehicles:plate:removeFakePlate', (src: number, netId: number) => {
  removeFakePlate(src, netId);
});

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
