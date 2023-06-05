import { RPC, Util, Vehicles } from '@dgx/server';
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
import { assignModelConfig } from 'modules/info/service.info';
import { Vector4 } from '@dgx/shared';

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
  vin?: string,
  plate?: string,
  upgrades?: Partial<Vehicles.Upgrades.All>
) => {
  // First we check model if model is vehicle on client
  const modelCheckPlayer = Number(GetPlayerFromIndex(0));
  if (!modelCheckPlayer) {
    mainLogger.error(`No players available to check model for 'spawnVehicle'`);
    return;
  }
  const modelInfo = await RPC.execute<ModelInfo>('vehicle:checkModel', modelCheckPlayer, model);
  if (!modelInfo || !modelInfo.valid) {
    mainLogger.error(`Spawn vehicle: invalid model ${model}`);
    return;
  }

  // force to be floats
  position = Vector4.create(position).add(0.001);

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

  const doesExist = await Util.awaitEntityExistence(veh);
  if (!doesExist) {
    mainLogger.error(`Spawn vehicle: vehicle didn't spawn | model: ${model}`);
    return;
  }

  const entityOwner = NetworkGetEntityOwner(veh);
  const vehNetId = NetworkGetNetworkIdFromEntity(veh);

  mainLogger.debug(
    `Spawn vehicle: spawned | model: ${model} | entity: ${veh} | netId: ${vehNetId} | owner: ${entityOwner}`
  );

  // If model is not yet loaded for entityowner, this heading native will not work
  // we still try because it sometimes fixed vehicles spawning at wrong place because 0 heading can be inside a wall
  if (entityOwner > 0) {
    emitNet('vehicle:setHeading', entityOwner, vehNetId, position.w);
  }

  const vehState = Entity(veh).state;

  const newVin = vin ?? vinManager.generateVin();
  vinManager.attachEntityToVin(newVin, veh);
  fuelManager.registerVehicle(veh);

  const newPlate = plate ?? plateManager.generatePlate();
  vehState.set('plate', newPlate, true);
  plateManager.registerPlate(newPlate);
  Vehicles.setVehicleNumberPlate(veh, newPlate);

  if (upgrades) {
    applyUpgradesToVeh(vehNetId, upgrades);
  }

  // in certain zones gta will spawn population peds in vehicles (had this happen multiple times at vehicle rental near pillbox)
  let npcDriverDeleteCounter = 20;
  const npcDriverDeleteThread = setInterval(() => {
    const exists = DoesEntityExist(veh);
    if (!exists) {
      clearInterval(npcDriverDeleteThread);
      return;
    }

    // wait till someone is in scope
    if (NetworkGetEntityOwner(veh) === -1) return;

    npcDriverDeleteCounter--;
    const pedInDriverSeat = GetPedInVehicleSeat(veh, -1);
    if (pedInDriverSeat && DoesEntityExist(pedInDriverSeat) && !IsPedAPlayer(pedInDriverSeat)) {
      DeleteEntity(pedInDriverSeat);
      clearInterval(npcDriverDeleteThread);
      return;
    }

    if (npcDriverDeleteCounter <= 0) {
      clearInterval(npcDriverDeleteThread);
    }
  }, 250);

  assignModelConfig(veh, modelHash);

  return veh;
};

export const spawnOwnedVehicle = async (src: number, vehicleInfo: Vehicle.Vehicle, position: Vec4) => {
  const vehicle = await spawnVehicle(
    vehicleInfo.model,
    { ...position, z: position.z + 0.5 },
    vehicleInfo.vin,
    vehicleInfo.plate
  );
  if (!vehicle) return;
  keyManager.addKey(vehicleInfo.vin, src);

  const vehNetId = NetworkGetNetworkIdFromEntity(vehicle);
  fuelManager.setFuelLevel(vehicle, vehicleInfo.status.fuel ?? 100);

  // If status is all null generate a perfect status and save it
  if (Object.values(vehicleInfo.status).every(v => v === null)) {
    // this really should never happen because we insert status when inserting new vehicle
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
    Util.awaitCondition(
      () => DoesEntityExist(vehicle) && GetVehicleNumberPlateText(vehicle).trim() === vehicleInfo.plate
    ).then(() => {
      applyFakePlate(src, vehNetId, vehicleInfo.fakeplate);
    });
  }
  if (vehicleInfo.stance) {
    setVehicleStance(vehicle, vehicleInfo.stance);
  }
  if (vehicleInfo.wax) {
    addWaxedVehicle(vehicleInfo.vin, vehicleInfo.wax);
  }

  setVehicleNosAmount(vehicle, vehicleInfo.nos);
  setVehicleHarnessUses(vehicle, vehicleInfo.harness);

  await applyUpgrades(vehicleInfo.vin);

  return vehicle;
};

export const deleteVehicle = (veh: number) => {
  if (!DoesEntityExist(veh)) return;
  DeleteEntity(veh);
};

export const getVinForVeh = (veh: number): string | null => {
  if (!veh || !DoesEntityExist(veh)) {
    mainLogger.warn('Cannot get VIN of nonexistent vehicle');
    return null;
  }
  const vehState = Entity(veh).state;
  if (!vehState?.vin) {
    validateVehicleVin(veh);
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

export const setNativeStatus = (vehicle: number, status: Partial<Omit<Vehicle.VehicleStatus, 'fuel'>>) => {
  if (!DoesEntityExist(vehicle)) return;

  if (status.body !== undefined) {
    SetVehicleBodyHealth(vehicle, status.body);
  }
  if (status.doors !== undefined) {
    status.doors.forEach((broken, doorId) => {
      if (!broken) return;
      SetVehicleDoorBroken(vehicle, doorId, true);
    });
  }
  Util.sendEventToEntityOwner(
    vehicle,
    'vehicles:client:setNativeStatus',
    NetworkGetNetworkIdFromEntity(vehicle),
    status
  );
};

export const setEngineState = (vehicle: number, state: boolean, instantly = false) => {
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Util.sendEventToEntityOwner(vehicle, 'vehicles:setEngineState', netId, state, instantly);
};
