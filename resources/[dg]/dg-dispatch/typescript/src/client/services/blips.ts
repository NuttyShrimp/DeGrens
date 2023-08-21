import { BlipManager, Jobs, Sync } from '@dgx/client';

const playersWithBlips = new Set<number>();
let blipsEnabled = false;

export const areBlipsEnabled = () => blipsEnabled;

const getBlipSettings = (info: Dispatch.BlipInfo): NBlip.Settings => {
  const ownJob = Jobs.getCurrentJob().name;

  const settings: NBlip.Settings = {
    heading: true,
    text: info.text,
    sprite: info.sprite ?? 1,
  };

  switch (info.job) {
    case 'police':
      settings.color = 3;
      if (ownJob !== 'police') {
        settings.category = 10;
      }
      break;
    case 'ambulance':
      settings.color = 7;
      if (ownJob !== 'police') {
        settings.category = 11;
      }
      break;
  }

  return settings;
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
