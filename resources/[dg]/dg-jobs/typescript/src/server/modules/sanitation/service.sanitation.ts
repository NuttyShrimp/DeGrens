import { Config, Events, Financials, Inventory, Notifications, RPC, Util, Vehicles } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import jobManager from 'classes/jobManager';
import { changeJob, disbandGroup, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { sanitationLogger } from './logger.sanitation';

let sanitationConfig: Sanitation.Config;
const activeGroups = new Map<string, Sanitation.Job>();

export const initializeSanitation = () => {
  sanitationConfig = Config.getConfigValue('jobs').sanitation;

  jobManager.registerJob('sanitation', {
    title: 'Vuilkar',
    size: 4,
    legal: true,
    icon: 'trash-can',
    location: { x: -346.0635, y: -1556.1328 },
    payout: {
      min: 500,
      max: 750,
      groupPercent: 5, // More people means WAY faster to complete so we dont really need payincrease
    },
  });
};

const getRandomLocationId = (currentId?: number) => {
  let locs = sanitationConfig.locations.filter((_, i) => i !== (currentId ?? -1));
  return Math.floor(Math.random() * locs.length);
};

const calculateTotalWithForgiveness = (total: number) => total - Math.ceil(total * 0.1);

const isGroupFinished = (groupId: string) => {
  return activeGroups.get(groupId)!.locationsDone >= sanitationConfig.amountOfLocationsPerJob;
};

export const startJobForGroup = async (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je zit niet in een groep', 'error');
    return;
  }

  const jobAssigned = changeJob(plyId, 'sanitation');
  if (!jobAssigned) return;

  const vehicle = await Vehicles.spawnVehicle('trash', sanitationConfig.vehicleLocation, plyId);
  if (!vehicle) return;
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Vehicles.giveKeysToPlayer(plyId, netId);
  const vin = Vehicles.getVinForVeh(vehicle);
  if (vin !== null) {
    Vehicles.setFuelLevel(vin, 100);
  }

  const locationId = getRandomLocationId();
  activeGroups.set(group.id, {
    netId,
    locationsDone: 0,
    location: { id: locationId, dumpsters: null, totalDumpsters: null },
  });

  const location = sanitationConfig.locations[locationId];
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Events.emitNet('jobs:sanitation:addLocation', m.serverId, netId, sanitationConfig.vehicleLocation, location);
  });
};

export const syncSanitationJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;
  sanitationLogger.silly(`Syncing active job to plyId ${plyId}`);
  const location = sanitationConfig.locations[active.location.id];
  Events.emitNet('jobs:sanitation:addLocation', plyId, active.netId, sanitationConfig.vehicleLocation, location);
  if (active.location.totalDumpsters !== null) {
    Events.emitNet(
      'jobs:sanitation:addTargetInfo',
      plyId,
      calculateTotalWithForgiveness(active.location.totalDumpsters)
    );
  }
};

export const finishJobForGroup = (plyId: number, netId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;
  if (active.netId !== netId) {
    Notifications.add(plyId, 'Dit is niet de gegeven vuilkar', 'error');
    return;
  }

  if (isGroupFinished(group.id)) {
    const payout = jobManager.getJobPayout('sanitation', group.members.length);
    group.members.forEach(m => {
      if (m.serverId === null) return;
      Financials.addCash(m.serverId, payout ?? 0, 'sanitation-payout');
    });
  }

  disbandGroup(group.id);
  Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  Util.Log('jobs:sanitation:finish', { ...active }, `${Util.getName(plyId)} finished sanitation for group`, plyId);
};

export const playerLeftGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:sanitation:cleanup', plyId);
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;

  activeGroups.delete(groupId);
  setTimeout(() => {
    Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  }, 10000);
  sanitationLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};

export const groupEnteredTarget = async (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but was not in group`);
    Util.Log(
      'jobs:sanitation:noGroup',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but was not in group`,
      plyId
    );
    return;
  }
  const active = activeGroups.get(group.id);
  if (!active) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but group was not active`);
    Util.Log(
      'jobs:sanitation:groupNotActive',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but group was not active`,
      plyId
    );
    return;
  }
  if (active.location.dumpsters !== null) return console.log('WAS NOT NULL ANYMORE');
  active.location.dumpsters = [];

  const dumpsters = await RPC.execute<Vec3[]>('jobs:sanitation:getDumpsterLocations', plyId);
  if (!dumpsters) {
    sanitationLogger.error(`Failed to get garbage locations for group ${group.id}`);
    return;
  }

  active.location.dumpsters = dumpsters;
  active.location.totalDumpsters = dumpsters.length;
  const totalWithForgiveness = calculateTotalWithForgiveness(dumpsters.length);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Events.emitNet('jobs:sanitation:addTargetInfo', m.serverId, totalWithForgiveness);
  });
};

export const takeBagFromDumpster = (plyId: number, location: Vec3) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but was not in group`);
    Util.Log(
      'jobs:sanitation:noGroup',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but was not in group`,
      plyId
    );
    return;
  }
  const active = activeGroups.get(group.id);
  if (!active) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but group was not active`);
    Util.Log(
      'jobs:sanitation:groupNotActive',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but group was not active`,
      plyId
    );
    return;
  }
  if (active.location.dumpsters === null) return false;

  const dumpster = Vector3.create(location);
  const dumpsterIdx = active.location.dumpsters.findIndex(l => dumpster.distance(l) < 0.5);
  if (dumpsterIdx === -1) return false;
  active.location.dumpsters.splice(dumpsterIdx, 1);

  let items: string[];
  if (Util.getRndInteger(1, 100) === 1) {
    items = [...sanitationConfig.specialLoot];
  } else {
    items = [...sanitationConfig.loot];
  }
  Inventory.addItemToPlayer(plyId, items[Math.floor(Math.random() * items.length)], 1);

  return true;
};

export const putBagInVehicle = (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but was not in group`);
    Util.Log(
      'jobs:sanitation:noGroup',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but was not in group`,
      plyId
    );
    return;
  }
  const active = activeGroups.get(group.id);
  if (!active) {
    sanitationLogger.error(`Player ${plyId} tried to do sanitation job action but group was not active`);
    Util.Log(
      'jobs:sanitation:groupNotActive',
      {},
      `${Util.getName(plyId)} tried to do sanitation job action but group was not active`,
      plyId
    );
    return;
  }
  if (active.location.dumpsters === null || active.location.totalDumpsters == null) return;

  const totalWithForgiveness = calculateTotalWithForgiveness(active.location.totalDumpsters);
  const amountLeftToDo = active.location.dumpsters.length - (active.location.totalDumpsters - totalWithForgiveness);

  let notif = '';
  if (amountLeftToDo === 0) {
    notif = 'Alle vuilniszakken zijn hier opgehaald';

    // If no bags remaining check for next location
    active.locationsDone++;
    if (isGroupFinished(group.id)) {
      notif = 'Je bent klaar, keer terug naar de vuilnisbelt om af te ronden!';
    } else {
      const locationId = getRandomLocationId(active.location.id);
      active.location = { id: locationId, dumpsters: null, totalDumpsters: null };

      const location = sanitationConfig.locations[locationId];
      group.members.forEach(m => {
        if (m.serverId === null) return;
        Events.emitNet(
          'jobs:sanitation:addLocation',
          m.serverId,
          active.netId,
          sanitationConfig.vehicleLocation,
          location
        );
      });
    }
  } else {
    notif = `Nog ${amountLeftToDo} vuilniszakken te gaan`;
  }
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Notifications.add(m.serverId, notif, 'info');
  });
};
