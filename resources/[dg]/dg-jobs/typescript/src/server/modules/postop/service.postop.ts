import { Config, Events, Notifications, Util, Vehicles, Financials, Phone } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { getGroupByServerId, changeJob, disbandGroup, getGroupById } from 'modules/groups/service';
import { postopLogger } from './logger.postop';
import { MULE_UPGRADES } from './contants.postop';

let postopConfig: PostOP.Config;
const activeGroups = new Map<string, PostOP.Job>();

export const initializePostop = () => {
  postopConfig = Config.getConfigValue('jobs').postop;

  jobManager.registerJob('postop', {
    title: 'PostOP',
    size: 2,
    legal: true,
    icon: 'truck',
    location: { x: -424.2247, y: -2789.7656 },
    // this is payout per package, gets multiplied by amount of packages player has delivered
    payout: {
      min: 50,
      max: 100,
      groupPercent: 30, // Can only do with 2 people so high percentage isnt a problem
    },
  });
};

const generateLocationSequence = (type: PostOP.JobType): number[] => {
  const typeConfig = postopConfig.types[type];
  const amount = Util.getRndInteger(typeConfig.locationsAmount.min, typeConfig.locationsAmount.max + 1);
  const locationKeys = [...postopConfig.locations.keys()];
  return Util.shuffleArray(locationKeys).slice(0, amount);
};

const getRandomTargetLocation = (type: PostOP.JobType, locationId: number): PostOP.TargetLocation => {
  const location = postopConfig.locations[locationId];
  const typeConfig = postopConfig.types[type];
  const amountOfDropoffs = Util.getRndInteger(typeConfig.dropoffAmount.min, typeConfig.dropoffAmount.max + 1);
  const choosenDropoffs = Util.shuffleArray(location.dropoffs).slice(0, amountOfDropoffs);
  return {
    center: location.center,
    dropoffs: choosenDropoffs,
    id: locationId,
  };
};

export const startJobForGroup = async (plyId: number, jobType: PostOP.JobType) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je zit niet in een groep', 'error');
    return;
  }

  if (Util.isAnyVehicleInRange(postopConfig.vehicleLocation, 5)) {
    Notifications.add(plyId, 'Er staat een voertuig in de weg', 'error');
    return;
  }

  const jobAssigned = changeJob(plyId, 'postop');
  if (!jobAssigned) return;

  const vehicleModel = postopConfig.types[jobType].model;
  const vehicle = await Vehicles.spawnVehicle(
    vehicleModel,
    postopConfig.vehicleLocation,
    plyId,
    undefined,
    `POSTOP${Util.getRndInteger(10, 99)}`,
    vehicleModel === 'mule' ? MULE_UPGRADES : undefined
  );
  if (!vehicle) {
    Notifications.add(plyId, 'Kon het voertuig niet uithalen', 'error');
    return;
  }
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Vehicles.giveKeysToPlayer(plyId, netId);
  Vehicles.setFuelLevel(vehicle, 100);

  const locationSequence = generateLocationSequence(jobType);
  const targetLocationId = locationSequence.shift()!;
  const targetLocation = getRandomTargetLocation(jobType, targetLocationId);

  const job: PostOP.Job = {
    netId,
    type: jobType,
    locationSequence,
    targetLocation,
    dropoffsBusy: new Set(),
    dropoffsDone: new Set(),
    packagesByPlayer: new Map(),
  };
  activeGroups.set(group.id, job);

  Util.Log(
    'jobs:postop:start',
    { jobType, locationSequence },
    `${Util.getName(plyId)} started postop job for group`,
    plyId
  );

  group.members.forEach(m => {
    if (m.serverId === null) return;
    sendOutStartEvents(m.serverId, job);
    Notifications.add(m.serverId, 'De locatie staat op je GPS aangeduid');
  });
};

export const syncPostOPJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;

  postopLogger.silly(`Syncing active job to plyId ${plyId}`);
  sendOutStartEvents(plyId, active);
};

const sendOutStartEvents = (plyId: number, job: PostOP.Job) => {
  Events.emitNet('jobs:postop:start', plyId, job.netId, postopConfig.vehicleLocation);
  Events.emitNet('jobs:postop:setLocation', plyId, job.targetLocation);
  Phone.showNotification(plyId, {
    id: 'postop_amount_tracker',
    title: `${job.dropoffsDone.size}/${job.targetLocation.dropoffs.length} afgeleverd`,
    description: '',
    sticky: true,
    keepOnAction: true,
    icon: 'jobcenter',
  });
};

export const finishJobForGroup = (plyId: number, netId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;
  if (active.netId !== netId) {
    Notifications.add(plyId, 'Dit is niet het gegeven voertuig', 'error');
    return;
  }

  // Calculate using delivered
  const payout = jobManager.getJobPayout('postop', group.members.length) ?? 0;
  group.members.forEach(m => {
    if (m.serverId === null) return;
    const amount = active.packagesByPlayer.get(m.cid);
    if (!amount) return;
    Financials.addCash(m.serverId, payout * amount, 'postop-payout');
  });

  disbandGroup(group.id);
  Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  Util.Log('jobs:postop:finish', { ...active }, `${Util.getName(plyId)} finished postop for group`, plyId);
};

export const playerLeftGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:postop:cleanup', plyId);
    Phone.removeNotification(plyId, 'postop_amount_tracker');
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;

  activeGroups.delete(groupId);
  setTimeout(() => {
    Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  }, 10000);
  postopLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};

export const startDropoff = (plyId: number, dropoffId: number): boolean => {
  const group = getGroupByServerId(plyId);
  if (!group) return false;
  const active = activeGroups.get(group.id);
  if (!active) return false;

  if (active.dropoffsDone.has(dropoffId)) return false;
  if (active.dropoffsBusy.has(dropoffId)) return false;

  active.dropoffsBusy.add(dropoffId);
  return true;
};

export const finishDropoff = (plyId: number, dropoffId: number, success: boolean) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const dropoffWasBusy = active.dropoffsBusy.delete(dropoffId);
  if (!success || !dropoffWasBusy) return;

  active.dropoffsDone.add(dropoffId);

  // increase package amount of player
  const cid = Util.getCID(plyId);
  const amountOfPackages = active.packagesByPlayer.get(cid) ?? 0;
  active.packagesByPlayer.set(cid, amountOfPackages + 1);

  // Check if all dropoffs are done for group
  let changedLocations = false;
  let isFinished = false;

  if (active.targetLocation.dropoffs.length === active.dropoffsDone.size) {
    changedLocations = true;
    const newLocationId = active.locationSequence.shift();

    if (newLocationId !== undefined) {
      active.dropoffsBusy.clear();
      active.dropoffsDone.clear();
      active.targetLocation = getRandomTargetLocation(active.type, newLocationId);
    } else {
      isFinished = true;
    }
  }

  group.members.forEach(m => {
    if (!m.serverId) return;
    Phone.updateNotification(m.serverId, 'postop_amount_tracker', {
      title: `${active.dropoffsDone.size}/${active.targetLocation.dropoffs.length} afgeleverd`,
    });

    if (changedLocations) {
      Events.emitNet('jobs:postop:setLocation', m.serverId, isFinished ? null : active.targetLocation);
      if (isFinished) {
        Notifications.add(m.serverId, 'Je bent klaar met bezorgen, keer terug en lever het voertuig in');
      } else {
        Notifications.add(m.serverId, 'Je bent hier klaar, ga naar de volgende locatie');
      }
    }
  });
};
