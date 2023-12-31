import { RPC, Sync, Util, Vehicles } from '@dgx/server';
import { insertVehicleStatus } from 'db/repository';
import { addWaxedVehicle, cleanVehicle } from 'modules/carwash/service.carwash';
import { setVehicleNosAmount } from 'modules/nos/service.nos';
import { setVehicleHarnessUses } from 'modules/seatbelts/service.seatbelts';
import { loadStance } from 'modules/stances/service.stances';
import { getNativeStatus, setNativeStatus } from 'modules/status/service.status';
import { fuelManager } from '../modules/fuel/classes/fuelManager';
import plateManager from '../modules/identification/classes/platemanager';
import vinManager from '../modules/identification/classes/vinmanager';
import { validateVehicleVin } from '../modules/identification/service.id';
import { keyManager } from '../modules/keys/classes/keymanager';
import { mainLogger } from '../sv_logger';
import { assignModelConfig } from 'modules/info/service.info';
import { Vector4 } from '@dgx/shared';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';
import {
  generateBaseCosmeticUpgrades,
  generateBasePerformanceUpgrades,
  mergeUpgrades,
} from '@shared/upgrades/service.upgrades';
import { setVehicleEngineSound } from 'services/enginesounds';
import { setVehicleAsVinScratched } from 'services/vinscratch';
import { setVehicleDoorsLocked } from 'modules/keys/service.keys';
import { charModule } from './core';
import persistencyModule from 'services/persistency';
import { getModelType } from './modeltypes';

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

  // we validate model on client to get modeltype
  const modelType = await getModelType(data.model);
  if (!modelType) {
    mainLogger.error(`Spawn vehicle: failed to find modeltype for ${data.model}`);
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

  const vehicle = CreateVehicleServerSetter(modelHash, modelType, position.x, position.y, position.z + 0.3, position.w); // 0.3 offset to avoid ground clipping
  // const vehicle = CreateVehicle(modelHash, position.x, position.y, position.z + 0.4, position.w, true, true);
  await Util.awaitEntityExistence(vehicle);

  if (!vehicle || !DoesEntityExist(vehicle)) {
    mainLogger.error(`Spawn vehicle: vehicle didn't spawn | model: ${data.model}`);
    return;
  }

  // // CREATE_VEHICLE is an RPC native, first owner will ALWAYS be a player. If that owning ply is far away (450m) we wait a max of 500ms for the owner to change back to server
  // const owner = NetworkGetEntityOwner(vehicle);
  // if (Util.getPlyCoords(owner).distance(position) > 450) {
  //   await Util.awaitCondition(() => NetworkGetEntityOwner(vehicle) !== owner, 500);
  // }

  // setting vin
  const vin = data.vin ?? vinManager.generateVin();
  vinManager.attachEntityToVin(vin, vehicle);

  // setting plate
  const plate = data.plate ?? plateManager.generatePlate();
  plateManager.registerPlate(plate);
  plateManager.setNumberPlate(vehicle, plate, data.isFakePlate);

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

  // door locks
  if (data.doorsLocked !== undefined) {
    setVehicleDoorsLocked(vehicle, data.doorsLocked);
  }

  Util.awaitOwnership(vehicle).then(owner => {
    if (!owner) return;

    // at this point, the first ownership has been taken
    // sync module will take care of any other ownership changes
    startNPCDriverDeletionThread(vehicle);

    // upgrades
    const mergedUpgrades = mergeUpgrades(
      generateBaseCosmeticUpgrades(false, upgradesManager.doesModelHaveDefaultExtras(modelHash)),
      generateBasePerformanceUpgrades(),
      data.upgrades ?? {}
    );
    upgradesManager.apply(vehicle, mergedUpgrades);

    // engine state
    if (data.engineState !== undefined) {
      setEngineState(vehicle, data.engineState, true);
    }

    cleanVehicle(vehicle);
  });

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  mainLogger.debug(
    `Spawned vehicle | model: ${data.model} | entity: ${vehicle} | netId: ${netId} | vin: ${vin} | plate: ${plate}`
  );

  persistencyModule.registerSpawnedVehicle({ vehicle, vin, plate, model: data.model });

  return {
    vehicle,
    netId,
    vin,
    plate,
  };
};

export const spawnOwnedVehicle = async (
  src: number | undefined,
  vehicleInfo: Vehicle.Vehicle,
  position: Vec4,
  engineState?: boolean,
  doorsLocked?: boolean
) => {
  const upgrades = await upgradesManager.getFull(vehicleInfo.vin);

  const spawnedVehicle = await spawnVehicle({
    model: vehicleInfo.model,
    position,
    vin: vehicleInfo.vin,
    plate: vehicleInfo.fakeplate ?? vehicleInfo.plate,
    isFakePlate: !!vehicleInfo.fakeplate,
    keys: src,
    upgrades,
    overrideStance: vehicleInfo.stance ?? undefined,
    engineState,
    fuel: vehicleInfo.status.fuel,
    doorsLocked,
  });
  if (!spawnedVehicle) return;
  const { vehicle, vin } = spawnedVehicle;

  // If status is all null generate a perfect status and save it
  if (Object.values(vehicleInfo.status).every(v => v === null)) {
    // this really should never happen because we insert status when inserting new vehicle
    getNativeStatus(vehicle, vin).then(status => {
      vehicleInfo.status = status;
      vehicleInfo.status.fuel = 100;
      insertVehicleStatus(vin, vehicleInfo.status);
    });
  } else {
    // Without timeout it does not wanna apply, probably because also doing mods at same moment
    setTimeout(() => {
      const vehicleStatus = vehicleInfo.status;
      setNativeStatus(vehicle, vehicleStatus as Vehicle.VehicleStatus);
    }, 500);
  }

  if (vehicleInfo.vinscratched) {
    setVehicleAsVinScratched(vehicle);
  }

  if (vehicleInfo.wax) {
    addWaxedVehicle(vin, vehicleInfo.wax);
  }

  if (vehicleInfo.engineSound) {
    setVehicleEngineSound(vehicle, vehicleInfo.engineSound);
  }

  setVehicleNosAmount(vehicle, vehicleInfo.nos);
  setVehicleHarnessUses(vehicle, vehicleInfo.harness);

  return vehicle;
};

export const deleteVehicle = (veh: number) => {
  if (!DoesEntityExist(veh)) return;
  persistencyModule.unregisterSpawnedVehicle(veh);
  DeleteEntity(veh);
};

export const getVinForVeh = (veh: number): string | null => {
  if (!veh || !DoesEntityExist(veh)) {
    mainLogger.warn('Cannot get VIN of nonexistent vehicle');
    return null;
  }
  return validateVehicleVin(veh).vin;
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

export const teleportInSeat = async (src: number, entity: number, seat = -1) => {
  const plyPed = GetPlayerPed(String(src));
  let attempts = 0;
  while (attempts < 20 && !GetPedInVehicleSeat(entity, seat)) {
    attempts++;
    await Util.Delay(100);
    TaskWarpPedIntoVehicle(plyPed, entity, seat);
  }
};

export const setEngineState = (vehicle: number, state: boolean, instantly = false) => {
  Sync.executeAction('vehicles:engine:setState', vehicle, state, instantly);
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
