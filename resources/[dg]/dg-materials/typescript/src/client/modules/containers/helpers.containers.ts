import { Util } from '@dgx/client';
import { CONTAINER_MODELS } from './constants.containers';

export const getContainerEntrance = (entity: number, extraOffset = 0) => {
  const model = GetEntityModel(entity);
  const doZOffset = CONTAINER_MODELS.find(d => d.model === model)?.doZOffset ?? true;
  const [min, max] = GetModelDimensions(model);
  const yOffset = (max[1] - min[1]) / -2;
  const zOffset = (max[2] - min[2]) / 2;
  const coords = Util.ArrayToVector3(
    GetOffsetFromEntityInWorldCoords(entity, 0, yOffset - extraOffset, doZOffset ? zOffset : 0)
  );
  return coords;
};
