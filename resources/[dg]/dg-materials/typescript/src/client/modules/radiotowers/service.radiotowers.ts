import {
  Events,
  Inventory,
  Minigames,
  Notifications,
  Particle,
  PolyTarget,
  PolyZone,
  RPC,
  Taskbar,
  Util,
} from '@dgx/client';

let radiotowers: Materials.Radiotowers.Config['towers'];

let activeTowerId: string | null = null;

export const initializeRadiotowers = (config: typeof radiotowers) => {
  radiotowers = config;

  for (const [towerId, tower] of Object.entries(radiotowers)) {
    const { w: heading, ...coords } = tower.position;
    PolyZone.addBoxZone('radiotower', coords, 25, 25, {
      data: { id: towerId },
      heading,
      minZ: coords.z - 5,
      maxZ: coords.z + 70,
    });
  }
};

export const enterTowerLocation = (towerId: string) => {
  activeTowerId = towerId;
  spawnPeds(towerId);
  radiotowers[activeTowerId].actions.forEach(a => {
    PolyTarget.addCircleZone('radiotower_action', a.position, 0.5, {
      useZ: true,
      data: {
        id: `${towerId}_${a.action}`,
        towerId,
        action: a.action,
      },
    });
  });
};

export const exitTowerLocation = (towerId: string) => {
  activeTowerId = null;
  PolyTarget.removeZone('radiotower_action');
};

const spawnPeds = async (towerId: string) => {
  const shouldSpawn = await RPC.execute<boolean>('materials:radiotower:shouldSpawnPeds', towerId);
  if (!shouldSpawn) return;

  radiotowers[towerId].peds.forEach(async pos => {
    const ped = await Util.spawnAggressivePed('s_m_y_blackops_02', pos, 0);
    TaskCombatPed(ped, PlayerPedId(), 0, 16);
    SetPedAsNoLongerNeeded(ped);
  });
};

export const disablePower = async (towerId: string) => {
  const canDisable = await RPC.execute<boolean>('materials:radiotower:canDisable', towerId);
  if (!canDisable) {
    Notifications.add('Dit staat al uit', 'error');
    return;
  }

  const minigameSuccess = await Minigames.keygame(3, 6, 25);
  if (!minigameSuccess) {
    Inventory.removeItemByNameFromPlayer('screwdriver');
    Notifications.add('Je schroevendraaier is verbrand', 'error');
    return;
  }

  Events.emitNet('materials:radiotower:dispatch', towerId);
  const [canceled] = await Taskbar.create('screwdriver', 'Saboteren', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  const coords = radiotowers[towerId].actions.find(a => a.action === 'disable')?.position;
  if (coords !== undefined) {
    Particle.add({
      dict: 'core',
      name: 'ent_sht_electrical_box',
      looped: false,
      coords,
    });
  }

  Events.emitNet('materials:radiotower:disable', towerId);
};
