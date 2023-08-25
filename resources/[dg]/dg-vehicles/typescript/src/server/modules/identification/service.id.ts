import { SQL, Util } from '@dgx/server';
import { getPlayerVehicleInfo } from 'db/repository';
import { setEngineState } from '../../helpers/vehicle';
import { fuelManager } from '../fuel/classes/fuelManager';
import vinManager from './classes/vinmanager';
import { handleVehicleLockForNewVehicle } from 'modules/keys/service.keys';
import plateManager from './classes/platemanager';
import { getConfigByEntity, getConfigByModel } from 'modules/info/service.info';

// set gets filled by vehicles without vin on entering, to disable engine when entered
const vehiclesToDisableEngine = new Set<number>();

export const validateVehicleVin = (vehicle: number, vehicleClass?: number): { vin: string; isNewVehicle: boolean } => {
  const vehicleState = Entity(vehicle).state;
  const vehStateVin = vehicleState.vin;
  if (vehStateVin && vinManager.doesVinMatch(vehStateVin, vehicle)) {
    return {
      vin: vehStateVin,
      isNewVehicle: false,
    };
  }

  // This is for vehicles new to the server
  const vin = vinManager.generateVin();
  vinManager.attachEntityToVin(vin, vehicle);

  const vehiclePlate = GetVehicleNumberPlateText(vehicle).trim();
  vehicleState.set('plate', vehiclePlate, true);
  plateManager.registerPlate(vehiclePlate);

  fuelManager.registerVehicle(vehicle);

  handleVehicleLockForNewVehicle(vehicle, vehicleClass);
  vehiclesToDisableEngine.add(vehicle);

  return {
    vin,
    isNewVehicle: true,
  };
};

export const disableEngineForNewVehicle = (vehicle: number) => {
  if (!vehiclesToDisableEngine.has(vehicle)) return;

  vehiclesToDisableEngine.delete(vehicle);
  setEngineState(vehicle, false, true);
};

export const doesVehicleHaveVin = (vehicle: number) => {
  const vin = Entity(vehicle).state?.vin;
  return vin != undefined && vinManager.doesVinMatch(vin, vehicle);
};

export const getCidFromVin = async (vin: string) => {
  const result = await SQL.query<{ cid: number }[]>(`SELECT cid FROM player_vehicles WHERE vin = ?`, [vin]);
  return result?.[0]?.cid;
};

export const isPlayerVehicleOwner = async (playerId: number, vin: string) => {
  const ownerCid = await getCidFromVin(vin);
  const playerCid = Util.getCID(playerId);
  return ownerCid === playerCid;
};

export const getClassOfVehicleWithVin = async (vin: string): Promise<Vehicles.Class | undefined> => {
  // Try to get it from model of existing vehicle entity
  const vehicle = vinManager.getEntity(vin);
  if (vehicle) {
    return getConfigByEntity(vehicle)?.class;
  }

  // if no entity exists and its not a known vin, means vin is invalid
  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) return;

  return getConfigByModel(vehicleInfo.model)?.class;
};
