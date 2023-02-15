import { Vector3 } from '@dgx/shared';
import { PROPATTACH_ITEMS } from './constants.postop';

export const getDistanceToFurthestCoord = (origin: Vec3, points: Vec3[]) => {
  const originVec = Vector3.create(origin);
  let distance = 0;
  for (const coord of points) {
    const dist = originVec.distance(coord);
    if (dist > distance) {
      distance = dist;
    }
  }
  return distance;
};

export const isAnyBackDoorOpen = (vehicle: number) => {
  if (IsVehicleDoorDamaged(vehicle, 2) || IsVehicleDoorDamaged(vehicle, 3)) return true;
  return GetVehicleDoorAngleRatio(vehicle, 2) !== 0 || GetVehicleDoorAngleRatio(vehicle, 3) !== 0;
};

export const getPropAttachItem = () => {
  return PROPATTACH_ITEMS[Math.floor(Math.random() * PROPATTACH_ITEMS.length)];
};
