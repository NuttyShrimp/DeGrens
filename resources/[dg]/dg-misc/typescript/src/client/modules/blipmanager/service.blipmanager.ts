import { EntityBlip, Util, Sync } from '@dgx/client';

const blips: Record<string, NBlipManager.Info & { category: string; handle: number | null }> = {};
const disabledCategory = new Set<string>();

const playerBlips = new Map<number, EntityBlip>();

const createBlip = (id: string, info: NBlipManager.Info) => {
  let newBlip: number;

  if ('radius' in info) {
    newBlip = AddBlipForRadius(info.coords.x, info.coords.y, info.coords.z, info.radius);
  } else {
    newBlip = AddBlipForCoord(info.coords.x, info.coords.y, info.coords.z);
    SetBlipSprite(newBlip, info.sprite);
    SetBlipScale(newBlip, info.scale ?? 1);
    SetBlipAsShortRange(newBlip, info.isShortRange ?? true);

    if (info.text) {
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentString(info.text);
      EndTextCommandSetBlipName(newBlip);
    }
  }

  SetBlipColour(newBlip, info.color ?? 0);
  SetBlipDisplay(newBlip, info.display ?? 6);

  blips[id].handle = newBlip;
};

const destroyBlip = (id: string) => {
  const info = blips[id];
  if (!info || !info.handle) return;
  RemoveBlip(info.handle);
  info.handle = null;
};

export const addBlip = (data: NBlipManager.CreateData) => {
  const { id, ...info } = data;

  // Destroy if already exists
  destroyBlip(id);

  blips[id] = { ...info, handle: null };

  if (!disabledCategory.has(info.category)) {
    createBlip(id, info);
  }
};

export const removeBlip = (id: string) => {
  destroyBlip(id);
  delete blips[id];
};

export const enableCategory = (category: string) => {
  const wasDisabled = disabledCategory.delete(category);
  if (!wasDisabled) return;

  for (const [id, info] of Object.entries(blips)) {
    if (info.category !== category) continue;
    if (info.handle) continue;
    createBlip(id, info);
  }
};

export const disableCategory = (category: string) => {
  if (disabledCategory.has(category)) return;
  disabledCategory.add(category);

  for (const [id, info] of Object.entries(blips)) {
    if (info.category !== category) continue;
    if (!info.handle) continue;
    destroyBlip(id);
  }
};

export const removeCategory = (category: string) => {
  // cache or we will have issues by modifying blips obj while iterating
  const idsToRemove: string[] = [];

  for (const [id, info] of Object.entries(blips)) {
    if (info.category !== category) continue;
    idsToRemove.push(id);
  }

  for (const id of idsToRemove) {
    destroyBlip(id);
    delete blips[id];
  }
};

export const addPlayerBlip = (plyId: number, settings: NBlip.Settings, startCoords: Vec3) => {
  if (playerBlips.has(plyId)) return;

  const blip = new EntityBlip('player', plyId, settings, startCoords);
  playerBlips.set(plyId, blip);
};

export const deletePlayerBlip = (plyId: number | number[]) => {
  if (Array.isArray(plyId)) {
    plyId.forEach(deletePlayerBlip);
    return;
  }

  const playerBlip = playerBlips.get(plyId);
  if (!playerBlip) return;

  playerBlip.destroy();
  playerBlips.delete(plyId);
};

export const handlePlayerEnteredScope = (plyId: number, localId: number) => {
  const playerBlip = playerBlips.get(plyId);
  if (!playerBlip) return;

  playerBlip.checkMode();
};

export const handlePlayerLeftScope = (plyId: number) => {
  const playerBlip = playerBlips.get(plyId);
  if (!playerBlip) return;

  playerBlip.checkMode();
};

export const updatePlayerBlipCoords = (plyId: number, coords: Vec3) => {
  const playerBlip = playerBlips.get(plyId);
  if (!playerBlip) return;
  playerBlip.updateCoords(coords);
};

export const changePlayerBlipSprite = (plyId: number, sprite: number) => {
  const playerBlip = playerBlips.get(plyId);
  if (!playerBlip) return;
  playerBlip.changeSprite(sprite);
};

export const startPlayerBlipCoordSaveThread = () => {
  setInterval(() => {
    for (const [_, playerBlip] of playerBlips) {
      playerBlip.saveCoords();
    }
  }, 1000);
};
