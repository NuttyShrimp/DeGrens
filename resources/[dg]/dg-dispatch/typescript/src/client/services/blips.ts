import { EntityBlip } from '@dgx/client';
// srvId to blipHandle
const blips: Map<number, EntityBlip> = new Map();

const getBlipSettings = (info: Dispatch.BlipInfo): NBlip.Settings => {
  if (info.job === 'police') {
    return {
      color: 3,
      heading: true,
      text: `Agent | ${info.callsign}`,
      category: 69,
    };
  }
  if (info.job === 'ambulance') {
    return {
      color: 23,
      heading: true,
      text: `Docter | ${info.callsign}`,
      category: 70,
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
  blips.forEach(blip => {
    blip.disable();
  });
  blips.clear();
};

export const syncBlips = (plys: Record<number, Dispatch.BlipInfo>) => {
  const plyId = GetPlayerServerId(PlayerId());
  const oldPlyIds = [...blips.keys()];
  const newPlyIds = Object.keys(plys).map(ply => Number(ply));
  const toRemove = oldPlyIds.filter(ply => !newPlyIds.includes(ply));
  const toAdd = newPlyIds.filter(ply => !oldPlyIds.includes(ply) && ply !== plyId);

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
  if (!blip) return;

  const existLocally = blip.doesEntityExistsLocally();
  if (blip.getMode() === 'entity') {
    if (!existLocally) {
      blip.changeMode('coords');
    }
  } else {
    if (existLocally) {
      blip.changeMode('entity');
    } else {
      blip.updateCoords(coords);
    }
  }
};
