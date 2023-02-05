import { Hospital, Inventory, Jobs, RayCast, Util } from '@dgx/client';

const entries: Record<string, RadialMenu.Entry[]> = {};

export const loadEntries = () => {
  const importAll = (requireContext: __WebpackModuleApi.RequireContext) => {
    requireContext.keys().forEach(file => {
      const newEntries: Record<string, RadialMenu.Entry[]> = requireContext(file);
      Object.entries(newEntries).forEach(([key, value]) => (entries[key] = value));
    });
  };
  importAll(require.context('../data', false, /\.ts$/));
};

export const openRadialMenu = async () => {
  const entries = await generateEntries();

  SetCursorLocation(0.5, 0.5);
  SetNuiFocus(true, true);
  SendNUIMessage({
    entries: entries,
  });
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

const getEnabledEntries = async (menuName: string, context: RadialMenu.Context) => {
  if (!entries[menuName]) {
    throw new Error(`[RadialMenu] ${menuName} is not a valid menu name`);
  }

  const menuEntries: RadialMenu.UIEntry[] = [];

  for (const entry of entries[menuName]) {
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

    menuEntries.push(uiEntry);
  }

  return menuEntries;
};
