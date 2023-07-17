import { Events, Sync, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const guards = new Map<string, { ped: number; deleteTimeout: NodeJS.Timeout; data: NPCs.Guard }>();

export const spawnGuard = async (guardData: NPCs.Guard) => {
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

  if (guardData.routingBucket) {
    SetEntityRoutingBucket(ped, guardData.routingBucket);
  }

  if (guardData.flags) {
    const entState = Entity(ped).state;
    for (const [key, value] of Object.entries(guardData.flags)) {
      entState.set(key, value, true);
    }
  }

  Sync.executeAction('npcs:guards:setup', ped, guardId, guardData);

  const deleteTimeout = startDeleteTimeout(guardId, guardData.deleteTime?.alive ?? 10 * 60);
  guards.set(guardId, { ped, deleteTimeout, data: guardData });
};

export const handleGuardDied = (guardId: string) => {
  const guardInfo = guards.get(guardId);
  if (!guardInfo) return;

  clearTimeout(guardInfo.deleteTimeout);

  const deleteTimeout = startDeleteTimeout(guardId, guardInfo.data.deleteTime?.dead ?? 60);
  guards.set(guardId, { ...guardInfo, deleteTimeout });

  // execute onDeath handler
  guardInfo.data.onDeath?.();
};

const handleEntityDeleted = (guardId: string) => {
  const guardInfo = guards.get(guardId);
  if (!guardInfo) return;

  clearTimeout(guardInfo.deleteTimeout);
  guards.delete(guardId);

  // execute onDeath handler
  guardInfo.data.onDeath?.();
};

export const transferGuardDeathCheck = async (guardId: string) => {
  const guardInfo = guards.get(guardId);
  if (!guardInfo) return;

  if (!DoesEntityExist(guardInfo.ped)) {
    handleEntityDeleted(guardId);
    return;
  }

  const owner = await Util.awaitOwnership(guardInfo.ped);
  if (!owner) {
    handleEntityDeleted(guardId);
    return;
  }

  Events.emitNet('npcs:guards:startDeathCheck', owner, NetworkGetNetworkIdFromEntity(guardInfo.ped), guardId);
};

const startDeleteTimeout = (guardId: string, delay: number) => {
  return setTimeout(() => {
    const guardInfo = guards.get(guardId);
    if (!guardInfo) return;
    guards.delete(guardId);
    if (!DoesEntityExist(guardInfo.ped) || GetEntityType(guardInfo.ped) !== 1) return;
    DeleteEntity(guardInfo.ped);
  }, delay * 1000);
};
