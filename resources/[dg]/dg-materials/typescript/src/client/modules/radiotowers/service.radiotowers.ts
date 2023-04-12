import {
  Events,
  Inventory,
  Minigames,
  Notifications,
  Particles,
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
  Events.emitNet('materials:radiotower:entered', towerId);
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
  Notifications.add('De security heeft je opgemerkt, maak dat je zo snel mogelijk weg bent!', 'error');
};

export const exitTowerLocation = (towerId: string) => {
  activeTowerId = null;
  PolyTarget.removeZone('radiotower_action');
  Events.emitNet('materials:radiotower:left', towerId);
};

export const spawnPeds = async (towerId: string) => {
  if (towerId !== activeTowerId) return;

  const netIds = (
    await Promise.all(
      radiotowers[towerId].peds.map(async pos => {
        const ped = await Util.spawnAggressivePed('s_m_y_blackops_02', { ...pos, w: 0 });
        if (!ped) return;
        TaskCombatPed(ped, PlayerPedId(), 0, 16);
        SetPedAsNoLongerNeeded(ped);
        return NetworkGetNetworkIdFromEntity(ped);
      })
    )
  ).filter(Boolean) as number[];

  Events.emitNet('materials:radiotower:despawnPeds', netIds);
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
    Particles.add({
      dict: 'core',
      name: 'ent_sht_electrical_box',
      looped: false,
      coords,
    });
  }

  Events.emitNet('materials:radiotower:disable', towerId);
};

export const spawnSwarm = async (towerId: string) => {
  const tower = radiotowers[towerId];
  const locations = [...tower.peds, ...tower.swarm];

  const netIds = (
    await Promise.all(
      locations.map(async pos => {
        const ped = await Util.spawnAggressivePed('s_m_y_blackops_02', { ...pos, w: 0 });
        if (!ped) return;
        TaskCombatPed(ped, PlayerPedId(), 0, 16);
        GiveWeaponToPed(ped, GetHashKey('WEAPON_SPECIALCARBINE_MK2'), 250, false, true);
        SetPedAsNoLongerNeeded(ped);
        return NetworkGetNetworkIdFromEntity(ped);
      })
    )
  ).filter(Boolean) as number[];

  Events.emitNet('materials:radiotower:despawnPeds', netIds);
};
