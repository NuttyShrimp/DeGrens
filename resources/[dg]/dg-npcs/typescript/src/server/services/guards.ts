import { Sync, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const guards = new Map<string, NPCs.ActiveGuard>();

let deathThread: NodeJS.Timer | null = null;

export const spawnGuard = async (guardData: NPCs.Guard, resourceName: string) => {
  const guardId = Util.uuidv4();

  const hash = typeof guardData.model === 'string' ? GetHashKey(guardData.model) : guardData.model;
  let heading = 0;
  if ('w' in guardData.position) {
    heading = guardData.position.w;
  } else if (guardData.heading) {
    heading = guardData.heading;
  }

  const ped = CreatePed(4, hash, guardData.position.x, guardData.position.y, guardData.position.z, heading, true, true);
  const exists = await Util.awaitEntityExistence(ped);
  if (!exists) {
    mainLogger.error(`Failed to spawn guard ${guardData.model} at ${JSON.stringify(guardData.position)}`);
    return;
  }

  if (guardData.routingBucket !== undefined) {
    SetEntityRoutingBucket(ped, guardData.routingBucket);
  }

  const entState = Entity(ped).state;
  entState.set('guardId', guardId, true); // use to check if we are deleting correct entity in timeouts

  if (guardData.flags) {
    for (const [key, value] of Object.entries(guardData.flags)) {
      entState.set(key, value, true);
    }
  }

  Sync.executeAction('npcs:guards:setup', ped, guardId, guardData);

  const deleteTimeout = startDeleteTimeout(guardId, guardData.deleteTime?.alive ?? 5 * 60);
  guards.set(guardId, {
    ped,
    deleteTimeout,
    data: guardData,
    health: 0,
    isDeath: false,
    resourceName,
  });

  // Will not do anything if deaththread is already running
  startDeathThread();
  return ped;
};

const startDeleteTimeout = (guardId: string, delay: number) => {
  return setTimeout(() => {
    const guardInfo = guards.get(guardId);
    if (!guardInfo) return;

    if (DoesEntityExist(guardInfo.ped) && Entity(guardInfo.ped).state.guardId === guardId) {
      DeleteEntity(guardInfo.ped);
    }

    handleGuardDeleted(guardId, guardInfo);
  }, delay * 1000);
};

const handleGuardDeleted = (guardId: string, guardInfo: NPCs.ActiveGuard) => {
  clearTimeout(guardInfo.deleteTimeout);
  if (!guardInfo.isDeath) {
    guardInfo.data.onDeath?.(-1);
  }
  guards.delete(guardId);
  if (guards.size === 0) {
    clearDeathThread();
  }
};

const startDeathThread = () => {
  if (deathThread !== null) return;

  deathThread = setInterval(() => {
    for (const [guardId, guardInfo] of guards) {
      // catch if ped was deleted by something else
      if (!DoesEntityExist(guardInfo.ped)) {
        handleGuardDeleted(guardId, guardInfo);
        continue;
      }

      if (guardInfo.isDeath) continue;

      const newHealth = GetEntityHealth(guardInfo.ped);
      // this check exists bcs for some reason this shit will return 0 for a short while after spawning ped so we filter that as we start health in guardInfo at 0
      if (guardInfo.health === newHealth) continue;

      guardInfo.health = newHealth;
      if (guardInfo.health > 0) continue;

      guardInfo.isDeath = true;

      // At this point, guard is dead so we cancel old delete timeout and start a new one with different time
      clearTimeout(guardInfo.deleteTimeout);
      guardInfo.deleteTimeout = startDeleteTimeout(guardId, guardInfo.data.deleteTime?.dead ?? 10);

      const killerPed = GetPedSourceOfDeath(guardInfo.ped);
      let killerServerId = -1;
      if (killerPed && DoesEntityExist(killerPed) && IsPedAPlayer(killerPed)) {
        killerServerId = NetworkGetEntityOwner(killerPed);
      }
      guardInfo.data.onDeath?.(killerServerId);
    }
  }, 100);
};

const clearDeathThread = () => {
  if (deathThread === null) return;
  clearInterval(deathThread);
  deathThread = null;
};

export const deleteGuardsOnResourceStop = (resourceName: string) => {
  const deleteAll = resourceName === GetCurrentResourceName();

  for (const [guardId, guardInfo] of guards) {
    if (!deleteAll && guardInfo.resourceName !== resourceName) continue;

    if (DoesEntityExist(guardInfo.ped) && Entity(guardInfo.ped).state.guardId === guardId) {
      DeleteEntity(guardInfo.ped);
    }

    handleGuardDeleted(guardId, guardInfo);
  }
};