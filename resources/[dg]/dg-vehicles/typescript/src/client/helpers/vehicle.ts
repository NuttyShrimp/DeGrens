import { RPC, Util } from '@dgx/client';
import { doorBones, wheelBones } from './../constant';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';
import {
  generateBaseCosmeticUpgrades,
  generateBasePerformanceUpgrades,
  mergeUpgrades,
} from '@shared/upgrades/service.upgrades';

let currentVehicle: number | null = null;
let isTheDriver = false;

export const setCurrentVehicle = (veh: number | null, driver: boolean) => {
  currentVehicle = veh;
  isTheDriver = driver;
};

export const getCurrentVehicle = (mustBeDriver = false) => {
  if (mustBeDriver && !isTheDriver) return null;
  return currentVehicle;
};

export const isDriver = () => {
  return isTheDriver;
};

export const getVehHalfLength = (pEntity: number) => {
  const [min, max] = GetModelDimensions(GetEntityModel(pEntity));
  const carLength = max[1] - min[1];
  return carLength / 2;
};

export const getModelType = (model: string | number) => {
  if (!IsModelValid(model) || !IsModelAVehicle(model)) return;

  // why the fuck is the getVehicletype native only on serverside, now i need to use this cancerous method
  // returns the type arg accepted in CreateVehicleServerSetter
  if (IsThisModelACar(model) || IsThisModelAQuadbike(model)) return 'automobile';
  if (IsThisModelABike(model)) return 'bike';
  if (IsThisModelABoat(model)) return 'boat';
  if (IsThisModelAHeli(model)) return 'heli';
  if (IsThisModelAPlane(model)) return 'plane';
  if (IsThisModelASubmersible(model)) return 'submarine';
  if (IsThisModelATrain(model)) return 'train';
  // default to automobile
  return 'automobile';
};

export const isCloseToAWheel = (pEntity: number, pDistance: number) => {
  const plyCoords = Util.getPlyCoords();
  return wheelBones.some(wheelBone => {
    const boneIndex = GetEntityBoneIndexByName(pEntity, wheelBone);
    if (boneIndex === -1) return false;

    const coordsWithOffset = Util.ArrayToVector3(GetWorldPositionOfEntityBone(pEntity, boneIndex));
    return coordsWithOffset.subtract(plyCoords).Length <= pDistance;
  });
};

export const isCloseToADoor = (vehicle: number, maxDistance: number) => {
  const plyCoords = Util.getPlyCoords();

  // if no door valid, still return true
  let amountOfValidDoors = 0;

  for (const doorBone of doorBones) {
    const boneIndex = GetEntityBoneIndexByName(vehicle, doorBone);
    if (boneIndex === -1) continue;

    const coordsWithOffset = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, boneIndex));
    const distance = coordsWithOffset.distance(plyCoords);
    amountOfValidDoors++;
    if (distance <= maxDistance) {
      return true;
    }
  }

  return amountOfValidDoors === 0;
};

export const getVehicleConfig = async (ent: number): Promise<Config.Car | null> => {
  const config = Entity(ent).state.config;
  if (!config) {
    const newConfig = await RPC.execute('vehicles:info:assignConfig', NetworkGetNetworkIdFromEntity(ent));
    return newConfig;
  }
  return config;
};

export const spawnLocalVehicle: Vehicles.SpawnLocalVehicleFunction = async data => {
  const modelHash = typeof data.model === 'number' ? data.model : GetHashKey(data.model);

  await Util.loadModel(modelHash);
  if (!HasModelLoaded(modelHash)) return;

  if (data.validateAfterModelLoad) {
    const validated = data.validateAfterModelLoad();
    if (!validated) {
      SetModelAsNoLongerNeeded(modelHash);
      return;
    }
  }

  // force to be floats
  const heading = 'w' in data.position ? data.position.w : 0;
  const vehicle = CreateVehicle(modelHash, data.position.x, data.position.y, data.position.z, heading, false, false);

  SetEntityInvincible(vehicle, !!data.invincible);
  FreezeEntityPosition(vehicle, !!data.invincible);
  SetVehicleDoorsLocked(vehicle, data.doorLockState ?? 0);

  if (data.plate) {
    SetVehicleNumberPlateText(vehicle, data.plate);
  }

  // upgrades
  const mergedUpgrades = mergeUpgrades({
    ...generateBaseCosmeticUpgrades(false, upgradesManager.doesVehicleHaveDefaultExtras(vehicle)),
    ...generateBasePerformanceUpgrades(),
    ...data.upgrades,
  });
  upgradesManager.set(vehicle, mergedUpgrades);

  SetModelAsNoLongerNeeded(modelHash);

  return vehicle;
};

export const useDummyVehicle = async <T>(
  model: string | number,
  func: (vehicle: number) => T | Promise<T>
): Promise<T> => {
  const modelHash = typeof model === 'string' ? GetHashKey(model) : model;
  await Util.loadModel(modelHash);

  const coords = Util.getPlyCoords();
  const vehicle = CreateVehicle(modelHash, coords.x, coords.y, coords.z + 4, 0, false, false);

  await Util.awaitEntityExistence(vehicle);

  FreezeEntityPosition(vehicle, true);
  SetEntityInvincible(vehicle, true);
  SetEntityCompletelyDisableCollision(vehicle, false, true);
  SetEntityVisible(vehicle, false, false);

  const result = func(vehicle);
  if (result instanceof Promise) await result;

  if (DoesEntityExist(vehicle) && !NetworkGetEntityIsNetworked(vehicle) && IsEntityAVehicle(vehicle)) {
    DeleteEntity(vehicle);
  }
  SetModelAsNoLongerNeeded(modelHash);

  return result;
};
