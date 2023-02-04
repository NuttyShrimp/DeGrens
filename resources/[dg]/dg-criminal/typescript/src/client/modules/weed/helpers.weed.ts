import { Util } from '@dgx/client';

export const lookAtPlant = (entity: number) => {
  const heading = Util.getHeadingToFaceEntity(entity);
  SetEntityHeading(PlayerPedId(), heading);
};
