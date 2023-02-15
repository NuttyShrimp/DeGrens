import { Events, Inventory, Util, Vehicles, Config } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { disbandGroup, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { sanddiggingLogger } from './logger.sanddigging';

let sanddiggingConfig: Sanddigging.Config;
export const getSanddiggingConfig = () => sanddiggingConfig;

const activeGroups = new Map<string, { spotId: number | null; vehNetId: number }>();

export const initializeSanddigging = () => {
  sanddiggingConfig = Config.getConfigValue('jobs').sanddigging;
  jobManager.registerJob('sanddigging', {
    title: 'Groevewerker',
    size: 2,
    legal: true,
    icon: 'shovel',
    location: { x: 2571.43, y: 2720.58 },
  });
};

const getRandomAvailableSpot = () => {
  let spotId: number | null = null;
  while (spotId === null) {
    const rnd = Math.floor(Math.random() * sanddiggingConfig.spots.length);
    if (Array.from(activeGroups.values()).some(active => active.spotId === rnd)) continue;
    spotId = rnd;
  }
  return spotId;
};

export const registerVehicleToGroup = (groupId: string, netId: number) => {
  activeGroups.set(groupId, { vehNetId: netId, spotId: null });
};

export const assignSpotToGroup = (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Util.Log(
      'jobs:sanddigging:noGroup',
      {},
      `${Util.getName(plyId)} tried to do sanddigging action but was not in a group`,
      plyId
    );
    sanddiggingLogger.warn(`${plyId} tried to do sanddigging action but was not in a group`);
    return;
  }
  const active = activeGroups.get(group.id);
  if (!active) {
    sanddiggingLogger.error(`${plyId} tried to do sanddigging action but group was not active`);
    return;
  }
  const spotId = getRandomAvailableSpot();
  activeGroups.set(group.id, { ...active, spotId });
  group.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:sanddigging:addTarget', member.serverId, spotId);
  });
};

export const receiveSpotLoot = (plyId: number, spotId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Util.Log(
      'jobs:sanddigging:noGroup',
      { spotId },
      `${Util.getName(plyId)} tried to do sanddigging action but was not in a group`,
      plyId
    );
    sanddiggingLogger.warn(`${plyId} tried to do sanddigging action but was not in a group`);
    return;
  }

  const active = activeGroups.get(group.id);
  if (active?.spotId !== spotId) {
    Util.Log(
      'jobs:sanddigging:invalidSpot',
      { spotId },
      `${Util.getName(plyId)} tried to loot sanddigging spot but spot was not assigned to his group`,
      plyId
    );
    sanddiggingLogger.warn(`${plyId} tried to loot sanddigging spot but spot was not assigned to his group`);
    return;
  }

  let itemName = 'sand';
  if (Util.getRndInteger(1, 101) < sanddiggingConfig.specialItemChance) {
    itemName = sanddiggingConfig.specialItems[Math.floor(Math.random() * sanddiggingConfig.specialItems.length)];
  }

  Inventory.addItemToPlayer(plyId, itemName, 1);
  Util.Log(
    'jobs:sanddigging:receive',
    {
      spotId,
      itemName,
    },
    `${Util.getName(plyId)} received loot for sanddigging`,
    plyId
  );
  sanddiggingLogger.silly(`${plyId} received loot (${itemName}) for sanddigging`);
};

export const syncSanddiggingJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;
  sanddiggingLogger.silly(`Syncing active job to plyId ${plyId}`);
  Events.emitNet('jobs:sanddigging:start', plyId, active.vehNetId);
  if (active.spotId) {
    Events.emitNet('jobs:sanddigging:addTarget', plyId, active.spotId);
  }
};

export const handlePlayerLeftSanddiggingGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:sanddigging:leftGroup', plyId);
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;

  activeGroups.delete(groupId);
  setTimeout(() => {
    Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.vehNetId));
  }, 10000);
  sanddiggingLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};

export const finishJob = (plyId: number, vehNetId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active || active.vehNetId !== vehNetId) return;
  disbandGroup(group.id);
  Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.vehNetId));

  Util.Log(
    'jobs:sanddigging:finish',
    {
      groupId: group.id,
    },
    `${Util.getName(plyId)}(${plyId}) finished sanddigging job for group`,
    plyId
  );
};
