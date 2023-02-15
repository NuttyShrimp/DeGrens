import { RPC } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

/**
 * Get vin of vehicle but does not validate vehicle if vin does not already exist
 * @param entity defaults to current vehicle ped is in
 * @returns VIN or null if entity is not a existing networked vehicle
 */
export const getVehicleVinWithoutValidation = (entity?: number): string | null => {
  if (!entity) {
    entity = getCurrentVehicle() ?? undefined;
  }
  if (!entity || !DoesEntityExist(entity) || !IsEntityAVehicle(entity) || !NetworkGetEntityIsNetworked(entity))
    return null;
  return Entity(entity).state?.vin ?? null;
};

/**
 * Get vin of vehicle
 * @param entity defaults to current vehicle ped is in
 * @returns VIN or null if validation failed or entity is not a existing networked vehicle
 */
export const getVehicleVin = async (entity?: number): Promise<string | null> => {
  if (!entity) {
    entity = getCurrentVehicle() ?? undefined;
  }
  if (!entity || !DoesEntityExist(entity) || !IsEntityAVehicle(entity) || !NetworkGetEntityIsNetworked(entity))
    return null;
  const vehState = Entity(entity).state;
  if (!vehState?.vin) {
    const vin = await RPC.execute<string>('vehicles:validateNewVehicle', NetworkGetNetworkIdFromEntity(entity));
    return vin;
  }
  return vehState.vin;
};
