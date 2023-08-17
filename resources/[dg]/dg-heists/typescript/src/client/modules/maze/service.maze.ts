import { Events, Util } from '@dgx/client';

export const startPanelHack = async (entity: number) => {
  if (!DoesEntityExist(entity)) return;

  const plyCoords = Util.getPlyCoords();
  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...plyCoords, w: heading });

  Events.emitNet('heists:maze:hackPanel');
};
