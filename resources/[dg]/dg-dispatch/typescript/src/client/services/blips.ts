import { EntityBlip } from '@dgx/client/classes/blip';
// srvId to blipHandle
const blips: Map<number, EntityBlip> = new Map();

const getBlipSettings = (info: Dispatch.BlipInfo): NBlip.Settings => {
  if (info.job === 'police') {
    return {
      color: 3,
      heading: true,
      text: `Agent | ${info.callsign}`,
    };
  }
  if (info.job === 'ambulance') {
    return {
      color: 23,
      heading: true,
      text: `Docter | ${info.callsign}`,
    };
  }
  return {};
};

const addBlip = (ply: number, info: Dispatch.BlipInfo, sprite?: number) => {
  const blipSettings = getBlipSettings(info);

  if (sprite) {
    blipSettings.sprite = sprite;
  }

  const blip = new EntityBlip('player', ply, blipSettings);
  blip.enable();
  blips.set(ply, blip);
};

const deleteBlip = (id: number) => {
  const blip = blips.get(id);
  if (!blip) return;
  blip.disable();
  blips.delete(id);
};

export const clearBlips = () => {
  blips.forEach((_, id) => {
    deleteBlip(id);
  });
};

export const syncBlips = (plys: Record<number, Dispatch.BlipInfo>) => {
  const plyId = GetPlayerServerId(PlayerId());
  const oldPly = [...blips.keys()];
  const newPlyIds = Object.keys(plys) as unknown as number[];
  const toRemove = oldPly.filter(ply => !newPlyIds.includes(ply));
  const toAdd = newPlyIds.filter(ply => !oldPly.includes(ply) && ply !== plyId);
  toRemove.forEach(ply => {
    const blip = blips.get(ply);
    blip?.disable();
    blips.delete(ply);
  });
  toAdd.forEach(ply => {
    addBlip(ply, plys[ply]);
  });
};

export const updateSprite = (plyId: number, info: Dispatch.BlipInfo, sprite: number) => {
  deleteBlip(plyId);

  addBlip(plyId, info, sprite);
};

export const updateBlipCoords = (plyId: number, coords: Vec3) => {
  const blip = blips.get(plyId);
  if (!blip || blip.mode === 'entity') return;

  blip.updateCoords(coords);
  if (blip.doesEntityExistsLocally()) {
    blip.changeMode('entity');
  }
};
