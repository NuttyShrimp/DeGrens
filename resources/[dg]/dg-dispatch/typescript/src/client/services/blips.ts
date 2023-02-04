import { EntityBlip } from '@dgx/client';
// srvId to blipHandle
const blips: Map<number, EntityBlip> = new Map();
let blipsEnabled = false;

export const areBlipsEnabled = () => blipsEnabled;

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

const addBlip = (ply: number, info: Dispatch.BlipInfo) => {
  const blipSettings = getBlipSettings(info);
  const blip = new EntityBlip('player', ply, blipSettings);
  blips.set(ply, blip);
};

const deleteBlip = (id: number) => {
  const blip = blips.get(id);
  if (!blip) return;
  blip.destroy();
  blips.delete(id);
};

export const clearBlips = () => {
  blips.forEach(blip => {
    blip.destroy();
  });
  blips.clear();
  blipsEnabled = false;
};

export const syncBlips = (plys: Record<number, Dispatch.BlipInfo>) => {
  blipsEnabled = true;

  const oldPlyIds = new Set(blips.keys());
  const newPlyIds = Object.keys(plys).reduce<Set<number>>((acc, key) => acc.add(Number(key)), new Set());

  // Remove blips that are in old but not in new
  for (const plyId of oldPlyIds) {
    if (newPlyIds.has(plyId)) continue;
    deleteBlip(plyId);
  }

  // Add blips that are in new but not in old
  const ownPlyId = GetPlayerServerId(PlayerId());
  for (const plyId of newPlyIds) {
    if (oldPlyIds.has(plyId) || plyId === ownPlyId) continue;
    addBlip(plyId, plys[plyId]);
  }
};

export const updateSprite = (plyId: number, info: Dispatch.BlipInfo, sprite: number) => {
  const blip = blips.get(plyId);
  if (!blip) return;
  blip.changeSprite(sprite);
};

export const updateBlipCoords = (plyId: number, coords: Vec3) => {
  const blip = blips.get(plyId);
  if (!blip) return;
  blip.updateCoords(coords);
};
