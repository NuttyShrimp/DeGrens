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
      min: 35,
      max: 45,
      groupPercent: 25, // Can only do with 2 people so high percentage isnt a problem
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

const buildPhoneNotificationData = (jobGroup: PostOP.Job) => {
  const isFinished = jobGroup.totalLocations === jobGroup.locationsDone;

  const data = {
    title: isFinished
      ? 'Je bent klaar'
      : `${jobGroup.dropoffsDone.size}/${jobGroup.targetLocation.dropoffs.length} afgeleverd`,
    description: isFinished
      ? 'Lever het voertuig in'
      : `${jobGroup.totalLocations - jobGroup.locationSequence.length}/${jobGroup.totalLocations} locaties gedaan`,
  };

  return data;
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
  const payoutLevel = jobManager.getJobPayoutLevel('postop');
  if (!jobAssigned || !payoutLevel) return;

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
  const vin = Vehicles.getVinForVeh(vehicle);
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  if (!vin || !netId) {
    Notifications.add(plyId, 'Kon het voertuig niet registreren', 'error');
    return;
  }

  Vehicles.giveKeysToPlayer(plyId, netId);
  Vehicles.setFuelLevel(vehicle, 100);

  const locationSequence = generateLocationSequence(jobType);
  const targetLocation = getRandomTargetLocation(jobType, locationSequence[0]);

  const job: PostOP.Job = {
    vin,
    type: jobType,
    locationSequence,
    targetLocation,
    dropoffsBusy: new Set(),
    dropoffsDone: new Set(),
    packagesByPlayer: new Map(),
    totalLocations: locationSequence.length,
    locationsDone: 0,
    payoutLevel,
  };
  activeGroups.set(group.id, job);

  Util.Log(
    'jobs:postop:start',
    {
      groupId: group.id,
      jobType,
      locationSequence,
    },
    `${Util.getName(plyId)}(${plyId}) started postop job for group`,
    plyId
  );

  const phoneNotificationData = buildPhoneNotificationData(job);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    sendOutStartEvents(m.serverId, job, netId, phoneNotificationData);
    Notifications.add(m.serverId, 'De locatie staat op je GPS aangeduid');
  });
};

export const syncPostOPJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;

  const netId = Vehicles.getNetIdOfVin(active.vin);
  if (!netId) {
    Notifications.add(plyId, 'Het jobvoertuig bestaat niet', 'error');
    return;
  }

  postopLogger.silly(`Syncing active job to plyId ${plyId}`);
  const phoneNotificationData = buildPhoneNotificationData(active);
  sendOutStartEvents(plyId, active, netId, phoneNotificationData);
};

const sendOutStartEvents = (
  plyId: number,
  job: PostOP.Job,
  netId: number,
  phoneNotificationData: ReturnType<typeof buildPhoneNotificationData>
) => {
  Events.emitNet('jobs:postop:start', plyId, netId, postopConfig.vehicleLocation);
  Events.emitNet('jobs:postop:setLocation', plyId, job.targetLocation);
  Phone.showNotification(plyId, {
    ...phoneNotificationData,
    id: 'postop_amount_tracker',
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

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) {
    Notifications.add(plyId, 'Dit is niet het gegeven voertuig', 'error');
    return;
  }

  // Calculate using delivered
  const payout = jobManager.getJobPayout('postop', group.size, active.payoutLevel) ?? 0;
  group.members.forEach(m => {
    if (m.serverId === null) return;
    const amount = active.packagesByPlayer.get(m.cid);
    if (!amount) return;
    const plyMultiplier = jobManager.getPlayerAmountOfJobsFinishedMultiplier(m.cid);
    Financials.addCash(m.serverId, payout * amount * plyMultiplier, 'postop-payout');
  });

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  Vehicles.deleteVehicle(vehicle);

  disbandGroup(group.id);
  Util.Log(
    'jobs:postop:finish',
    {
      groupId: group.id,
      packagesByPlayer: [...active.packagesByPlayer.entries()],
    },
    `${Util.getName(plyId)}(${plyId}) finished postop for group`,
    plyId
  );
};

export const handlePlayerLeftPostOPGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:postop:cleanup', plyId);
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;

  activeGroups.delete(groupId);
  setTimeout(
    (vin: string) => {
      const netId = Vehicles.getNetIdOfVin(vin);
      if (!netId) return;
      const vehicle = NetworkGetEntityFromNetworkId(netId);
      Vehicles.deleteVehicle(vehicle);
    },
    10000,
    active.vin
  );
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
  let finishedLocation = false;
  let finishedAllLocations = false;

  if (active.targetLocation.dropoffs.length === active.dropoffsDone.size) {
    finishedLocation = true;
    active.locationSequence.shift();
    active.locationsDone++;

    if (active.locationSequence[0] !== undefined) {
      active.dropoffsBusy.clear();
      active.dropoffsDone.clear();
      active.targetLocation = getRandomTargetLocation(active.type, active.locationSequence[0]);
    } else {
      finishedAllLocations = true;
    }
  }

  const phoneNotificationData = buildPhoneNotificationData(active);
  group.members.forEach(m => {
    if (!m.serverId) return;
    Phone.updateNotification(m.serverId, 'postop_amount_tracker', phoneNotificationData);

    if (finishedLocation) {
      Events.emitNet('jobs:postop:setLocation', m.serverId, finishedAllLocations ? null : active.targetLocation);
    }
  });
};

export const skipCurrentLocation = (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  active.locationSequence.shift();
  active.locationsDone++;
  active.dropoffsBusy.clear();
  active.dropoffsDone.clear();

  // Check if all dropoffs are done for group
  let finishedAllLocations = false;
  if (active.locationSequence[0] !== undefined) {
    active.targetLocation = getRandomTargetLocation(active.type, active.locationSequence[0]);
  } else {
    finishedAllLocations = true;
  }

  const phoneNotificationData = buildPhoneNotificationData(active);
  group.members.forEach(m => {
    if (!m.serverId) return;
    Phone.updateNotification(m.serverId, 'postop_amount_tracker', phoneNotificationData);
    Events.emitNet('jobs:postop:setLocation', m.serverId, finishedAllLocations ? null : active.targetLocation);
  });
};
