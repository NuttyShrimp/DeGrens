const disabledCategory = new Set<string>();
const blips: Record<string, NBlipManager.Info & { category: string; blip: number | null }> = {};

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

  blips[id].blip = newBlip;
};

const destroyBlip = (id: string) => {
  const info = blips[id];
  if (!info || !info.blip) return;
  RemoveBlip(info.blip);
  info.blip = null;
};

global.exports('addBlip', (data: NBlipManager.CreateData) => {
  const { id, ...info } = data;

  // Destroy if already exists
  destroyBlip(id);

  blips[id] = { ...info, blip: null };

  if (!disabledCategory.has(info.category)) {
    createBlip(id, info);
  }
});

global.exports('removeBlip', (id: string) => {
  destroyBlip(id);
  delete blips[id];
});

global.exports('enableCategory', (category: string) => {
  const wasDisabled = disabledCategory.delete(category);
  if (!wasDisabled) return;

  for (const [id, info] of Object.entries(blips)) {
    if (info.category !== category) continue;
    if (info.blip) continue;
    createBlip(id, info);
  }
});

global.exports('disableCategory', (category: string) => {
  if (disabledCategory.has(category)) return;
  disabledCategory.add(category);

  for (const [id, info] of Object.entries(blips)) {
    if (info.category !== category) continue;
    if (!info.blip) continue;
    destroyBlip(id);
  }
});

global.exports('removeCategory', (category: string) => {
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
});
