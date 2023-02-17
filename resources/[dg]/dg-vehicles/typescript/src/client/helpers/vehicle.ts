import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { doorBones, wheelBones } from './../constant';

let currentVehicle: number | null = null;
let isTheDriver = false;

export const setCurrentVehicle = (veh: number | null, driver: boolean) => {
  currentVehicle = veh;
  isTheDriver = driver;
};

export const getCurrentVehicle = () => {
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

export const isCloseToHood = (pEntity: number, pDistance: number, pMustBeOpen = false) => {
  const boneIndex = GetEntityBoneIndexByName(pEntity, 'bonnet');
  if (pMustBeOpen && boneIndex !== -1 && GetVehicleDoorAngleRatio(pEntity, 4) === 0) return false;

  const plyCoords = Util.getPlyCoords();
  let coordsWithOffset: Vector3;
  if (boneIndex !== -1) {
    coordsWithOffset = Util.ArrayToVector3(GetWorldPositionOfEntityBone(pEntity, boneIndex));
  } else {
    const [min, max] = GetModelDimensions(GetEntityModel(pEntity));
    const carLength = max[1] - min[1];
    coordsWithOffset = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(pEntity, 0, carLength / 2, 0));
  }

  return coordsWithOffset.distance(plyCoords) < pDistance;
};

export const isCloseToBoot = (pEntity: number, pDistance: number, pMustBeOpen = false) => {
  const boneIndex = GetEntityBoneIndexByName(pEntity, 'boot');
  if (pMustBeOpen && boneIndex !== -1 && GetVehicleDoorAngleRatio(pEntity, 5) === 0) return false;

  const plyCoords = Util.getPlyCoords();
  let coordsWithOffset: Vector3;
  if (boneIndex !== -1) {
    coordsWithOffset = Util.ArrayToVector3(GetWorldPositionOfEntityBone(pEntity, boneIndex));
  } else {
    const [min, max] = GetModelDimensions(GetEntityModel(pEntity));
    const carLength = max[1] - min[1];
    coordsWithOffset = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(pEntity, 0, -carLength / 2, 0));
  }

  return coordsWithOffset.subtract(plyCoords).Length < pDistance;
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

export const isCloseToADoor = (vehicle: number, distance: number) => {
  const plyCoords = Util.getPlyCoords();
  return doorBones.some(doorBone => {
    const boneIndex = GetEntityBoneIndexByName(vehicle, doorBone);
    if (boneIndex === -1) return false;
    const coordsWithOffset = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, boneIndex));
    return coordsWithOffset.distance(plyCoords) <= distance;
  });
};

export const isVehicleUpsideDown = (vehicle: number) => {
  const vehRoll = GetEntityRoll(vehicle);
  return vehRoll > 65 || vehRoll < -65;
};
