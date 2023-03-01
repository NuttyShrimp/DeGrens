import { Hospital, Inventory, Jobs, RayCast, Util } from '@dgx/client';
import { MAXIMUM_ENTRIES_PER_MENU } from '../constants';

// @ts-ignore
import { entries as entryArray } from '../data/*.ts';

const entries: Record<string, RadialMenu.Entry[]> = {};

export const loadEntries = () => {
  const importAll = (r: [string, any][]) => {
    r.forEach(([_, file]) => {
      Object.entries(file as Record<string, RadialMenu.Entry[]>).forEach(([key, value]) => (entries[key] = value));
    });
  };
  importAll(entryArray);
};

export const openRadialMenu = async () => {
  const entries = await generateEntries();

  SetCursorLocation(0.5, 0.5);
  SetNuiFocus(true, true);
  SendNUIMessage({
    entries: entries,
  });
};

export const handleRadialMenuClose = () => {
  SetNuiFocus(false, false);
};

const generateEntries = async () => {
  const ped = PlayerPedId();
  const playerData = DGCore.Functions.GetPlayerData();

  let vehicle: number | undefined = GetVehiclePedIsIn(ped, false);
  if (vehicle === 0) vehicle = undefined;

  const hit = RayCast.doRaycast();
  let entity = hit.entity;
  if (!hit.entity || !hit.coords || Util.getPlyCoords().distance(hit.coords) > 5) {
    entity = undefined;
  }

  const items = Inventory.getCachedItemNames();

  // If down then use down entries else use main
  const startMenuName = Hospital.isDown() ? 'down' : 'main';
  const context: RadialMenu.Context = {
    playerData,
    job: Jobs.getCurrentJob(),
    currentVehicle: vehicle,
    raycastEntity: entity,
    items,
    closestPlayerDistance: Util.getDistanceToClosestPlayerOutsideVehicle(),
  };

  const entries = await getEnabledEntries(startMenuName, context);
  return entries;
};

const getEnabledEntries = async (menuName: string, context: RadialMenu.Context, offset = 0) => {
  if (!entries[menuName]) {
    throw new Error(`[RadialMenu] ${menuName} is not a valid menu name`);
  }

  const enabledEntries: RadialMenu.UIEntry[] = [];

  for (let i = offset; i < entries[menuName].length; i++) {
    // If enabledentries is at max, split remaing items to submenu
    if (enabledEntries.length === MAXIMUM_ENTRIES_PER_MENU) {
      const subEntries = await getEnabledEntries(menuName, context, i);
      const extraEntry: RadialMenu.UIEntry = {
        title: 'Meer',
        icon: 'ellipsis',
        items: subEntries,
      };
      enabledEntries.push(extraEntry);
      break;
    }

    const entry = entries[menuName][i];

    if (entry.minimumPlayerDistance && context.closestPlayerDistance > entry.minimumPlayerDistance) continue;

    // Check required job
    if (entry.jobs && entry.jobs.findIndex(j => j === context.job.name) === -1) continue;

    // Check required items
    if (entry.items && !entry.items.every(i => context.items.includes(i))) continue;

    if (entry.isEnabled) {
      const result = entry.isEnabled(context);
      let enabled = false;
      if (result instanceof Promise) {
        enabled = await result;
      } else {
        enabled = result;
      }
      if (!enabled) continue;
    }

    const uiEntry: RadialMenu.UIEntry = {
      title: entry.title,
      icon: entry.icon,
      shouldClose: entry.shouldClose,
    };

    if ('subMenu' in entry) {
      uiEntry.items = await getEnabledEntries(entry.subMenu, context);
    } else {
      uiEntry.type = entry.type;
      uiEntry.event = entry.event;
      uiEntry.data = entry.data;
    }

    enabledEntries.push(uiEntry);
  }

  return enabledEntries;
};
