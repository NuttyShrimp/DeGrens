import { RPC, Util, Vehicles } from '@dgx/server';
import { insertVehicleStatus } from 'db/repository';
import { addWaxedVehicle } from 'modules/carwash/service.carwash';
import { setVehicleNosAmount } from 'modules/nos/service.nos';
import { setVehicleHarnessUses } from 'modules/seatbelts/service.seatbelts';
import { loadStance } from 'modules/stances/service.stances';
import { getNativeStatus } from 'modules/status/service.status';
import { fuelManager } from '../modules/fuel/classes/fuelManager';
import plateManager from '../modules/identification/classes/platemanager';
import vinManager from '../modules/identification/classes/vinmanager';
import { validateVehicleVin } from '../modules/identification/service.id';
import { keyManager } from '../modules/keys/classes/keymanager';
import { mainLogger } from '../sv_logger';
import { assignModelConfig } from 'modules/info/service.info';
import { Vector4 } from '@dgx/shared';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';
import { generateBaseCosmeticUpgrades, generateBasePerformanceUpgrades } from '@shared/upgrades/service.upgrades';
import { STANDARD_EXTRA_UPGRADES } from '@shared/upgrades/constants.upgrades';

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

  // 'entityCreated' event does not get emitted when using the serversetter. We manually check to catch blacklisted models
  const modelIsBlacklisted = global.exports['dg-misc'].isModelBlacklisted(data.model);
  if (modelIsBlacklisted) {
    mainLogger.error(`Spawn vehicle: blacklisted | model: ${data.model}`);
    return;
  }

  // force to be floats
  const position = Vector4.create({ w: 0, ...data.position }).add(0.001);
  const modelHash = GetHashKey(data.model);
  const vehicle = CreateVehicleServerSetter(modelHash, modelType, position.x, position.y, position.z, position.w);

  const doesExist = await Util.awaitEntityExistence(vehicle);
  if (!doesExist) {
    mainLogger.error(`Spawn vehicle: vehicle didn't spawn | model: ${data.model}`);
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);

  mainLogger.debug(`Spawn vehicle: spawned | model: ${data.model} | entity: ${vehicle} | netId: ${netId}`);

  // setting vin
  const vin = data.vin ?? vinManager.generateVin();
  vinManager.attachEntityToVin(vin, vehicle);

  // setting plate
  const plate = data.plate ?? plateManager.generatePlate();
  plateManager.registerPlate(plate);
  Vehicles.setNumberPlate(vehicle, plate, data.isFakePlate);

  // setting fuel
  fuelManager.registerVehicle(vehicle, data.fuel);

  // add keys
  if (data.keys !== undefined) {
    keyManager.addKey(vin, data.keys);
  }

  loadStance({
    vin,
    vehicle,
    overrideStance: data.overrideStance,
    checkOverrideStance: false,
  });

  assignModelConfig(vehicle);

  Util.awaitOwnership(vehicle).then(owner => {
    if (!owner) return;

    // at this point, the first ownership has been taken
    // sync module will take care of any other ownership changes
    startNPCDriverDeletionThread(vehicle);

    // upgrades
    const mergedUpgrades = {
      ...generateBaseCosmeticUpgrades(true, STANDARD_EXTRA_UPGRADES.includes(modelType)),
      ...generateBasePerformanceUpgrades(),
      ...data.upgrades,
    };
    upgradesManager.apply(vehicle, mergedUpgrades);
  });

  return {
    vehicle,
    netId,
    vin,
    plate,
  };
};

export const spawnOwnedVehicle = async (src: number, vehicleInfo: Vehicle.Vehicle, position: Vec4) => {
  const upgrades = await upgradesManager.getFull(vehicleInfo.vin);

  const spawnedVehicle = await spawnVehicle({
    model: vehicleInfo.model,
    position: {
      ...position,
      z: position.z + 0.5,
    },
    vin: vehicleInfo.vin,
    plate: vehicleInfo.fakeplate ?? vehicleInfo.plate,
    isFakePlate: !!vehicleInfo.fakeplate,
    keys: src,
    upgrades,
    overrideStance: vehicleInfo.stance ?? undefined,
  });
  if (!spawnedVehicle) return;
  const { vehicle, vin } = spawnedVehicle;

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

  if (vehicleInfo.wax) {
    addWaxedVehicle(vin, vehicleInfo.wax);
  }

  setVehicleNosAmount(vehicle, vehicleInfo.nos);
  setVehicleHarnessUses(vehicle, vehicleInfo.harness);

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

export const getCurrentVehicle = (plyId: number, mustBeDriver = false): number | undefined => {
  const ped = GetPlayerPed(String(plyId));
  if (!ped) return;
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  if (mustBeDriver && ped !== GetPedInVehicleSeat(vehicle, -1)) return;
  return vehicle;
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

const startNPCDriverDeletionThread = (vehicle: number) => {
  let counter = 20;
  const thread = setInterval(() => {
    if (counter <= 0) {
      clearInterval(thread);
      return;
    }
    counter--;

    if (!DoesEntityExist(vehicle)) {
      clearInterval(thread);
      return;
    }

    const pedInDriverSeat = GetPedInVehicleSeat(vehicle, -1);
    if (pedInDriverSeat && DoesEntityExist(pedInDriverSeat) && !IsPedAPlayer(pedInDriverSeat)) {
      DeleteEntity(pedInDriverSeat);
      clearInterval(thread);
    }
  }, 250);
};
