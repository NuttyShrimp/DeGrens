import { Util } from '@dgx/client';

export const getBackCoordsOfEntity = (entity: number) => {
  const [vehicleDimensionMin, vehicleDimensionMax] = GetModelDimensions(GetEntityModel(entity));
  const halfLength = (vehicleDimensionMax[1] - vehicleDimensionMin[1]) / -2;
  return Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0.0, halfLength + 0.5, 0.0));
};
