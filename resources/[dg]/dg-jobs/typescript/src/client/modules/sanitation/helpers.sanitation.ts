import { Util } from '@dgx/client';

export const isAtBack = (vehicle: number) => {
  const model = GetEntityModel(vehicle);
  const [min, max] = GetModelDimensions(model);
  const yOffset = (max[1] - min[1]) / -2;
  const zOffset = (max[2] - min[2]) / 2;
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, yOffset, zOffset));
  return Util.getPlyCoords().distance(coords) < 2;
};
