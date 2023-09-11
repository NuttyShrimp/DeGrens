import { Events, Notifications, PolyTarget, RPC, Taskbar, Util } from '@dgx/client';
import { playOpeningAnim } from './helpers.portrobbery';

const activeLocations: Record<number, Vec4> = {};

export const loadPortrobberyInitData = (initData: Materials.PortRobbery.InitData) => {
  PolyTarget.removeZone('portrobberyCodeInputZone');
  PolyTarget.addBoxZone(
    'portrobberyCodeInputZone',
    initData.codeInputZone.center,
    initData.codeInputZone.width,
    initData.codeInputZone.length,
    {
      ...initData.codeInputZone.options,
      data: {},
    }
  );

  for (const location of initData.activeLocationZones) {
    buildPortrobberyLocationZone(location.idx, location.coords);
  }
};

export const buildPortrobberyLocationZone = (idx: number, coords: Vec4) => {
  activeLocations[idx] = coords;
  PolyTarget.addBoxZone('portrobberyLocation', coords, 0.8, 2.2, {
    minZ: coords.z - 0.8,
    maxZ: coords.z + 1.5,
    heading: coords.w,
    data: {
      id: `location_${idx}`,
      locationIdx: idx,
    },
    routingBucket: 0,
  });
};

export const destroyPortrobberyLocationZone = (idx: number) => {
  delete activeLocations[idx];
  PolyTarget.removeZone('portrobberyLocation', `location_${idx}`);
};

export const startLootingPortrobberyLocation = async (idx: number) => {
  const coords = activeLocations[idx];
  if (!coords) throw new Error(`Location idx ${idx} has no linked coords`);

  const canStart = await RPC.execute<boolean>('materials:portrobbery:canLoot', idx);
  if (!canStart) {
    Notifications.add('Deze container is al geopend', 'error');
    return;
  }

  await Util.goToCoords(coords);

  SetEntityCoords(PlayerPedId(), coords.x, coords.y, coords.z - 1, false, false, false, false);
  SetEntityHeading(PlayerPedId(), coords.w);

  await playOpeningAnim();

  Events.emitNet('materials:portrobbery:loot', idx);
};

export const openPortrobberyCam = async (cam: Materials.PortRobbery.Config['cams'][number]) => {
  const [canceled] = await Taskbar.create('camera-cctv', 'CCTV Bekijken', 5000, {
    canCancel: false,
    cancelOnMove: false,
    cancelOnDeath: true,
    disableInventory: true,
    disablePeek: true,
    disarm: false,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@heists@prison_heiststation@cop_reactions',
      anim: 'cop_b_idle',
      flags: 16,
    },
  });
  if (canceled) return;

  Util.enterCamera({
    allowMovement: false,
    coords: cam.coords,
    rotation: cam.rotation,
  });
};
