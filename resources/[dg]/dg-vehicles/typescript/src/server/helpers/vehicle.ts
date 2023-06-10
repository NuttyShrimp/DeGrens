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
export const spawnVehicle: Vehicles.SpawnVehicleFunction = async data => {
  if (data.vin) {
    const exisitingVehicleWithVin = vinManager.getEntity(data.vin);
    if (exisitingVehicleWithVin) {
      mainLogger.error(`Spawn vehicle: vin already in use | vin: ${data.vin} | model: ${data.model}`);
      return;
    }
  }

  // First we check model if model is vehicle on client
  const modelCheckPlayer = +GetPlayerFromIndex(0);
  if (!modelCheckPlayer) {
    mainLogger.error(`No players available to check model for 'spawnVehicle'`);
    return;
  }
  const modelType = await RPC.execute<string | undefined>('vehicles:getModelType', modelCheckPlayer, data.model);
  if (!modelType) {
    mainLogger.error(`Spawn vehicle: invalid model ${data.model}`);
    return;
  }

  // force to be floats
  const position = Vector4.create({ w: 0, ...data.position }).add(0.001);
  const modelHash = GetHashKey(data.model);
  const vehicle = CreateVehicleServerSetter(modelHash, modelType, position.x, position.y, position.z, position.w);

  // entityCreated event does not get emitted when using the serversetter. We emulate this event to catch blacklisted models
  emit('entityCreated', vehicle);

  const doesExist = await Util.awaitEntityExistence(vehicle);
  if (!doesExist) {
    mainLogger.error(`Spawn vehicle: vehicle didn't spawn (or was deleted during creation) | model: ${data.model}`);
    return;
  }

  const entityOwner = NetworkGetEntityOwner(vehicle);
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vehState = Entity(vehicle).state;

  mainLogger.debug(
    `Spawn vehicle: spawned | model: ${data.model} | entity: ${vehicle} | netId: ${netId} | owner: ${entityOwner}`
  );

  // If model is not yet loaded for entityowner, this heading native will not work
  // we still try because it sometimes fixed vehicles spawning at wrong place because 0 heading can be inside a wall
  if (entityOwner > 0) {
    emitNet('vehicle:setHeading', entityOwner, netId, position.w);
  }

  // setting vin
  const vin = data.vin ?? vinManager.generateVin();
  vinManager.attachEntityToVin(vin, vehicle);

  // setting plate
  const plate = data.plate ?? plateManager.generatePlate();
  vehState.set('plate', plate, true);
  plateManager.registerPlate(plate);
  Vehicles.setVehicleNumberPlate(vehicle, plate);

  // setting fuel
  fuelManager.registerVehicle(vehicle, data.fuel);

  // add keys
  if (data.keys !== undefined) {
    keyManager.addKey(vin, data.keys);
  }

  // applying upgrades
  if (data.upgrades) {
    applyUpgradesToVeh(netId, data.upgrades);
  }

  // in certain zones gta will spawn population peds in vehicles (had this happen multiple times at vehicle rental near pillbox)
  let npcDriverDeleteCounter = 20;
  const npcDriverDeleteThread = setInterval(() => {
    const exists = DoesEntityExist(vehicle);
    if (!exists) {
      clearInterval(npcDriverDeleteThread);
      return;
    }

    // wait till someone is in scope
    if (NetworkGetEntityOwner(vehicle) === -1) return;

    npcDriverDeleteCounter--;
    const pedInDriverSeat = GetPedInVehicleSeat(vehicle, -1);
    if (pedInDriverSeat && DoesEntityExist(pedInDriverSeat) && !IsPedAPlayer(pedInDriverSeat)) {
      DeleteEntity(pedInDriverSeat);
      clearInterval(npcDriverDeleteThread);
      return;
    }

    if (npcDriverDeleteCounter <= 0) {
      clearInterval(npcDriverDeleteThread);
    }
  }, 250);

  assignModelConfig(vehicle, modelHash);

  return {
    vehicle,
    netId,
    vin,
    plate,
  };
};

export const spawnOwnedVehicle = async (src: number, vehicleInfo: Vehicle.Vehicle, position: Vec4) => {
  const spawnedVehicle = await spawnVehicle({
    model: vehicleInfo.model,
    position: {
      ...position,
      z: position.z + 0.5,
    },
    vin: vehicleInfo.vin,
    plate: vehicleInfo.plate,
    keys: src,
  });
  if (!spawnedVehicle) return;
  const { vehicle, netId, vin, plate } = spawnedVehicle;

  // If status is all null generate a perfect status and save it
  if (Object.values(vehicleInfo.status).every(v => v === null)) {
    // this really should never happen because we insert status when inserting new vehicle
    setImmediate(async () => {
      vehicleInfo.status = await getNativeStatus(vehicle, vin);
      vehicleInfo.status.fuel = 100;
      await insertVehicleStatus(vin, vehicleInfo.status);
    });
  } else {
    // Without timeout it does not wanna apply, probably because also doing mods at same moment
    setTimeout(() => {
      const vehicleStatus = vehicleInfo.status;
      setNativeStatus(vehicle, vehicleStatus as Vehicle.VehicleStatus);
    }, 500);
  }

  if (vehicleInfo.fakeplate) {
    Util.awaitCondition(() => DoesEntityExist(vehicle) && GetVehicleNumberPlateText(vehicle).trim() === plate).then(
      () => {
        applyFakePlate(src, netId, vehicleInfo.fakeplate);
      }
    );
  }
  if (vehicleInfo.stance) {
    setVehicleStance(vehicle, vehicleInfo.stance);
  }
  if (vehicleInfo.wax) {
    addWaxedVehicle(vin, vehicleInfo.wax);
  }

  setVehicleNosAmount(vehicle, vehicleInfo.nos);
  setVehicleHarnessUses(vehicle, vehicleInfo.harness);

  await applyUpgrades(vin);

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
