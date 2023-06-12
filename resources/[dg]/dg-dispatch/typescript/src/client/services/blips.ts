import { BlipManager, Sync } from '@dgx/client';

const playersWithBlips = new Set<number>();
let blipsEnabled = false;

export const areBlipsEnabled = () => blipsEnabled;

const getBlipSettings = (info: Dispatch.BlipInfo): NBlip.Settings => {
  if (info.job === 'police') {
    return {
      color: 3,
      heading: true,
      text: info.text,
      category: 10,
    };
  }
  if (info.job === 'ambulance') {
    return {
      color: 23,
      heading: true,
      text: info.text,
      category: 11,
    };
  }
  return {};
};

const addBlip = (plyId: number, info: Dispatch.BlipInfo) => {
  const blipSettings = getBlipSettings(info);
  const plyCoords = Sync.getPlayerCoords(plyId);
  BlipManager.addPlayerBlip(plyId, 'dispatch', blipSettings, plyCoords);
  playersWithBlips.add(plyId);
};

export const clearBlips = () => {
  BlipManager.deletePlayerBlip([...playersWithBlips], 'dispatch');
  playersWithBlips.clear();
  blipsEnabled = false;
};

export const syncBlips = (plys: Record<number, Dispatch.BlipInfo>) => {
  blipsEnabled = true;

  const oldPlyIds = new Set(playersWithBlips);
  const newPlyIds = new Set(Object.keys(plys).map(Number));

  // Remove blips that are in old but not in new
  for (const plyId of oldPlyIds) {
    if (newPlyIds.has(plyId)) continue;

    BlipManager.deletePlayerBlip(plyId, 'dispatch');
    playersWithBlips.delete(plyId);
  }

  // Add blips that are in new but not in old
  const ownPlyId = GetPlayerServerId(PlayerId());
  for (const plyId of newPlyIds) {
    if (oldPlyIds.has(plyId) || plyId === ownPlyId) continue;
    addBlip(plyId, plys[plyId]);
  }
};

export const updateSprite = (plyId: number, sprite: number) => {
  if (!playersWithBlips.has(plyId)) return;
  BlipManager.changePlayerBlipSprite(plyId, sprite);
};
