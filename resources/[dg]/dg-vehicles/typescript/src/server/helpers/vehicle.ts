import { RPC, Util } from '@dgx/server';
import vehicles from '@dgx/server/classes/vehicles';
import { insertVehicleStatus } from 'db/repository';
import { addWaxedVehicle } from 'modules/carwash/service.carwash';
import { setVehicleNosAmount } from 'modules/nos/service.nos';
import { setVehicleHarnessUses } from 'modules/seatbelts/service.seatbelts';
import { setVehicleStance } from 'modules/stances/service.stance';
import { getNativeStatus } from 'modules/status/service.status';
import { applyUpgrades, applyUpgradesToVeh } from 'modules/upgrades/service.upgrades';

import { fuelManager } from '../modules/fuel/classes/fuelManager';
import plateManager from '../modules/identification/classes/platemanager';
import vinManager from '../modules/identification/classes/vinmanager';
import { applyFakePlate, validateVehicleVin } from '../modules/identification/service.id';
import { keyManager } from '../modules/keys/classes/keymanager';
import { CREATE_AUTOMOBILE } from '../sv_constants';
import { mainLogger } from '../sv_logger';

/**
 * Spawn a vehicle
 * @param model String version of vehicle model
 * @param position Vec4 of spawn position
 * @param owner Owner of vehicle (Used to check model)
 * @param vin
 * @param plate
 * @param upgrades
 * @returns Entity Id of spawned vehicle
 */
export const spawnVehicle = async (
  model: string,
  position: Vec4,
  owner?: number,
  vin?: string,
  plate?: string,
  upgrades?: Partial<Upgrades.All>
) => {
  // First we check model if model is vehicle on client
  let modelCheckPlayer = owner;
  if (!modelCheckPlayer) {
    const firstPlayer = DGCore.Functions.GetPlayers()[0];
    if (!firstPlayer) {
      mainLogger.error(`No players available to check model for 'spawnVehicle'`);
      return;
    }
    modelCheckPlayer = firstPlayer;
    mainLogger.info(`No owner provided for 'spawnVehicle', using first found player to check model.`);
  }
  const modelInfo = await RPC.execute<modelInfo>('vehicle:checkModel', modelCheckPlayer, model);
  if (!modelInfo || !modelInfo.valid) {
    mainLogger.error(`Spawn vehicle: invalid model ${model} | modelCheckPlayer: ${modelCheckPlayer}`);
    return;
  }

  let veh: number;
  const modelHash = GetHashKey(model);
  if (modelInfo.automobile) {
    // Cheeky little hack to get this func working
    veh = (Citizen as any).invokeNativeByHash(
      0x00000000,
      CREATE_AUTOMOBILE,
      modelHash,
      position.x,
      position.y,
      position.z,
      position.w
    );
  } else {
    veh = CreateVehicle(modelHash, position.x, position.y, position.z, position.w, true, true);
  }
  SetEntityHeading(veh, position.w);

  const doesExist = await Util.awaitEntityExistence(veh);
  if (!doesExist) {
    mainLogger.error(`Spawn vehicle: vehicle didn't spawn | model: ${model}`);
    return;
  }
  mainLogger.debug(
    `Spawn vehicle: spawned | model: ${model} | entity: ${veh} | netId: ${NetworkGetNetworkIdFromEntity(veh)}`
  );

  const vehNetId = NetworkGetNetworkIdFromEntity(veh);
  if (!vin) {
    vin = vinManager.generateVin(vehNetId);
  } else {
    vinManager.attachVinToNetId(vin, vehNetId);
  }
  const vehState = Entity(veh).state;
  vehState.set('vin', vin, true);
  fuelManager.registerVehicle(vin);
  plate = plate ?? plateManager.generatePlate();
  SetVehicleNumberPlateText(veh, plate);
  vehState.set('plate', plate, true);
  plateManager.registerPlate(plate);

  // Setting plate sometimes does not work when entity just spawned yey scuffed ass shit
  setTimeout(() => {
    if (GetVehicleNumberPlateText(veh) === plate) return;
    SetVehicleNumberPlateText(veh, plate!);
  }, 1000);

  if (upgrades) {
    applyUpgradesToVeh(vehNetId, upgrades);
  }
  return veh;
};

export const spawnOwnedVehicle = async (src: number, vehicleInfo: Vehicle.Vehicle, position: Vec4) => {
  const vehicle = await spawnVehicle(
    vehicleInfo.model,
    { ...position, z: position.z + 0.5 },
    src,
    vehicleInfo.vin,
    vehicleInfo.plate
  );
  if (!vehicle) return;
  keyManager.addKey(vehicleInfo.vin, src);

  const vehNetId = NetworkGetNetworkIdFromEntity(vehicle);
  fuelManager.setFuelLevel(vehicleInfo.vin, vehicleInfo.status.fuel ?? 100);

  // If status is all null generate a perfect status and save it
  if (Object.values(vehicleInfo.status).every(v => v === null)) {
    setImmediate(async () => {
      vehicleInfo.status = await getNativeStatus(vehicle, vehicleInfo.vin);
      vehicleInfo.status.fuel = 100;
      await insertVehicleStatus(vehicleInfo.vin, vehicleInfo.status);
    });
  } else {
    // Without timeout it does not wanna apply, probably because also doing mods at same moment
    setTimeout(() => {
      const vehicleStatus = vehicleInfo.status;
      setNativeStatus(vehicle, vehicleStatus as Vehicle.VehicleStatus);
    }, 500);
  }

  if (vehicleInfo.fakeplate) {
    applyFakePlate(src, vehNetId, vehicleInfo.fakeplate);
  }
  if (vehicleInfo.stance) {
    setVehicleStance(vehicle, vehicleInfo.stance);
  }
  if (vehicleInfo.wax) {
    addWaxedVehicle(vehicleInfo.vin, vehicleInfo.wax);
  }
  if (vehicleInfo.nos) {
    setVehicleNosAmount(vehicle, vehicleInfo.nos);
  }
  setVehicleHarnessUses(vehicleInfo.vin, vehicleInfo.harness);
  applyUpgrades(vehicleInfo.vin);

  return vehicle;
};

export const deleteVehicle = (veh: number) => {
  if (!DoesEntityExist(veh)) return;
  const vehState = Entity(veh).state; // Get from state, getter functions validates if does not exist which we dont want
  if (vehState?.vin) {
    fuelManager.removeVehicle(vehState.vin);
  }
  DeleteEntity(veh);
};

export const getVinForVeh = (veh: number): string | null => {
  if (!veh || !DoesEntityExist(veh)) {
    mainLogger.warn('Cannot get VIN of nonexistent vehicle');
    return null;
  }
  const vehState = Entity(veh).state;
  if (!vehState?.vin) {
    validateVehicleVin(NetworkGetNetworkIdFromEntity(veh));
  }
  return vehState?.vin ?? null;
};

export const getVinForNetId = (netId: number): string | null => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  return getVinForVeh(veh);
};

export const isDriver = (ply: number): boolean => {
  const plyPed = GetPlayerPed(String(ply));
  if (!plyPed) return false;
  const plyVeh = GetVehiclePedIsIn(plyPed, false);
  if (!plyVeh) return false;
  const vehDriverPed = GetPedInVehicleSeat(plyVeh, -1);
  return plyPed === vehDriverPed;
};

export const teleportInSeat = async (src: string, entity: number, seat = -1) => {
  const plyPed = GetPlayerPed(src);
  let attempts = 0;
  while (attempts < 20 && !GetPedInVehicleSeat(entity, seat)) {
    attempts++;
    await Util.Delay(100);
    TaskWarpPedIntoVehicle(plyPed, entity, seat);
  }
};

export const setNativeStatus = (vehicle: number, status: Omit<Vehicle.VehicleStatus, 'fuel'>) => {
  Util.sendEventToEntityOwner(
    vehicle,
    'vehicles:client:setNativeStatus',
    NetworkGetNetworkIdFromEntity(vehicle),
    status
  );
};
