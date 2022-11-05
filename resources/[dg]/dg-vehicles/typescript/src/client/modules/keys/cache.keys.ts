import { Events, RPC } from '@dgx/client';
import { getCurrentVehicle, getVehicleVinWithoutValidation } from '@helpers/vehicle';

// We cache all keys we have, to avoid unneeded server calls which slows down things like radialmenu isEnabled and peek canInteract
const keyCache: Set<string> = new Set();

onNet('DGCore:client:playerLoaded', async () => {
  keyCache.clear();
  const allVins = await RPC.execute<string[]>('vehicles:keys:getAll');
  (allVins ?? []).forEach(vin => {
    keyCache.add(vin);
  });
});

Events.onNet('vehicles:keys:addToCache', (vin: string) => {
  keyCache.add(vin);
});

Events.onNet('vehicles:keys:removeFromCache', (vin: string) => {
  keyCache.delete(vin);
});

export const hasVehicleKeys = (vehicle: number) => {
  if (!DoesEntityExist(vehicle) || !NetworkGetEntityIsNetworked(vehicle)) return false;
  // Validation not required because if vin does not already exist, we wont have keys anyway
  const vin = getVehicleVinWithoutValidation(vehicle);
  if (!vin) return false;
  return keyCache.has(vin);
};

global.exports('hasVehicleKeys', (entity?: number) => {
  if (entity && !IsEntityAVehicle(entity)) return false;
  const vehicle = entity ?? getCurrentVehicle();
  if (!vehicle) return false;
  return hasVehicleKeys(vehicle);
});
