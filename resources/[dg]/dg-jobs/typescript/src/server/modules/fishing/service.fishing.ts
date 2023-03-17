import { Events, Notifications, Vehicles, Util, Inventory, Financials, Config, Phone } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { changeJob, disbandGroup, getGroupByCid, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { VEHICLE_FOR_JOBTYPE } from './constants.fishing';
import { fishingLogger } from './logger.fishing';

let fishingConfig: Fishing.Config;
const activeGroups = new Map<string, Fishing.Job>();

export const initializeFishing = () => {
  fishingConfig = Config.getConfigValue('jobs').fishing;
  jobManager.registerJob('fishing', {
    title: 'Vissen',
    size: 4,
    legal: true,
    icon: 'fish',
    location: { x: -2080.4377, y: 2609.925 },
    // THIS IS THE PAYOUT PER FISH
    payout: {
      min: 40,
      max: 50,
      groupPercent: 25,
    },
  });
};

const getRandomFishingLocationForJobType = (jobType: Fishing.JobType) => {
  const locations = fishingConfig.spots[jobType];
  return locations[Math.floor(Math.random() * locations.length)];
};

const buildPhoneNotificationData = (jobGroup: Fishing.Job) => {
  const isFinished = getTotalFishOfActive(jobGroup) === jobGroup.maxFish;

  const data = {
    title: isFinished ? 'Je bent klaar' : `${getTotalFishOfActive(jobGroup)}/${jobGroup.maxFish} gevangen`,
    description: isFinished ? 'Lever het voertuig in' : '',
  };

  return data;
};

export const startJobForGroup = async (plyId: number, jobType: Fishing.JobType) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je zit niet in een groep', 'error');
    return;
  }

  const vehicleLocation = fishingConfig.vehicle[jobType].coords;
  if (Util.isAnyVehicleInRange(vehicleLocation, 5)) {
    Notifications.add(plyId, 'Er staat een voertuig in de weg', 'error');
    return;
  }

  const jobAssigned = changeJob(plyId, 'fishing');
  const payoutLevel = jobManager.getJobPayoutLevel('fishing');
  if (!jobAssigned || !payoutLevel) return;

  const vehicle = await Vehicles.spawnVehicle(VEHICLE_FOR_JOBTYPE[jobType], vehicleLocation, plyId);
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

  if (jobType === 'boat') {
    global.exports['dg-misc'].toggleBoatAnchor(vehicle);
  }

  const jobGroup: Fishing.Job = {
    vin,
    location: getRandomFishingLocationForJobType(jobType),
    jobType,
    fishPerCid: new Map(),
    maxFish: 10 * group.members.length,
    payoutLevel,
  };
  activeGroups.set(group.id, jobGroup);

  Util.Log(
    'jobs:fishing:start',
    {
      groupId: group.id,
      location: jobGroup.location,
      jobType: jobType,
      maxFish: jobGroup.maxFish,
    },
    `${Util.getName(plyId)}(${plyId}) started sanitation job for group`,
    plyId
  );

  const phoneNotificationData = buildPhoneNotificationData(jobGroup);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    sendOutStartEvents(m.serverId, jobGroup, netId, phoneNotificationData);

    if (jobType === 'boat') {
      Notifications.add(m.serverId, 'Vergeet het anker van de boot niet op te halen');
    }
  });
};

const sendOutStartEvents = (
  plyId: number,
  active: Fishing.Job,
  netId: number,
  phoneNotificationData: ReturnType<typeof buildPhoneNotificationData>
) => {
  Events.emitNet('jobs:fishing:start', plyId, netId, active.location, active.jobType);
  Phone.showNotification(plyId, {
    ...phoneNotificationData,
    id: 'fishing_amount_tracker',
    sticky: true,
    keepOnAction: true,
    icon: 'jobcenter',
  });
};

export const syncFishingJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;

  const netId = Vehicles.getNetIdOfVin(active.vin);
  if (!netId) {
    Notifications.add(plyId, 'Het jobvoertuig bestaat niet', 'error');
    return;
  }

  fishingLogger.silly(`Syncing active job to plyId ${plyId}`);
  const phoneNotificationData = buildPhoneNotificationData(active);
  sendOutStartEvents(plyId, active, netId, phoneNotificationData);
};

export const finishFishingJob = (plyId: number, netId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) {
    Notifications.add(plyId, 'Dit is niet het gegeven visvoertuig', 'error');
    return;
  }

  disbandGroup(group.id);
  const payoutPerFish = jobManager.getJobPayout('fishing', group.size, active.payoutLevel);
  if (payoutPerFish === null) {
    fishingLogger.error(`Could not get payout data for job`);
    return;
  }

  for (const [cid, fishAmount] of active.fishPerCid) {
    const plyId = DGCore.Functions.getPlyIdForCid(cid);
    if (!plyId) {
      fishingLogger.warn(`Could not pay ${cid} for fishing, player is not in server`);
      continue;
    }
    const plyMultiplier = jobManager.getPlayerAmountOfJobsFinishedMultiplier(cid);
    Financials.addCash(plyId, fishAmount * payoutPerFish * plyMultiplier, 'fishing-payout');
  }

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  Vehicles.deleteVehicle(vehicle);

  Util.Log(
    'jobs:fishing:finish',
    {
      groupId: group.id,
      fishPerCid: [...active.fishPerCid.entries()],
    },
    `${Util.getName(plyId)}(${plyId}) finished fishing for group`,
    plyId
  );
};

const getTotalFishOfActive = (active: Fishing.Job) => {
  return Array.from(active.fishPerCid.values()).reduce((acc, cur) => acc + cur, 0);
};

export const addFishToGroupVehicle = (plyId: number, netId: number) => {
  const cid = Util.getCID(plyId);
  const group = getGroupByCid(cid);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) {
    Notifications.add(plyId, 'Dit is niet het gegeven visvoertuig', 'error');
    return;
  }

  let isFinished = false;
  const totalFishAmount = getTotalFishOfActive(active);
  if (totalFishAmount + 1 >= active.maxFish) {
    isFinished = true;
    if (totalFishAmount + 1 > active.maxFish) return;
  }

  const amountOfCid = active.fishPerCid.get(cid) ?? 0;
  active.fishPerCid.set(cid, amountOfCid + 1);
  activeGroups.set(group.id, active);
  fishingLogger.silly(`Fishamount for group ${group.id} has been increased by ${cid}`);

  const phoneNotificationData = buildPhoneNotificationData(active);
  const returnCoords = fishingConfig.vehicle[active.jobType].coords;
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Phone.updateNotification(m.serverId, 'fishing_amount_tracker', phoneNotificationData);

    if (isFinished) {
      Notifications.add(plyId, 'Het voertuig zit vol, lever het voertuig in om je betaling te ontvangen!', 'success');
      Util.setWaypoint(plyId, returnCoords);
    }
  });
};

export const handlePlayerLeftFishingGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:fishing:cleanup', plyId);
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
  fishingLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};

export const useFishingRod = (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je bent momenteel geen visser', 'error');
    return;
  }
  const active = activeGroups.get(group.id);
  if (!active) {
    Notifications.add(plyId, 'Je bent momenteel geen visser', 'error');
    return;
  }
  const coords = Util.getPlyCoords(plyId);
  const radius = active.jobType === 'boat' ? 75 : 20;
  if (coords.distance(active.location) > radius) {
    Notifications.add(plyId, 'Je bent niet op de visplek', 'error');
    return;
  }

  Events.emitNet('jobs:fishing:useRod', plyId);
};

export const trySpecialLoot = (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return false;
  const active = activeGroups.get(group.id);
  if (!active) return false;

  Util.changePlayerStress(plyId, -5);

  const specialLootConfig = fishingConfig.specialLoot;
  if (Util.getRndInteger(1, 101) > specialLootConfig.chance) return false;

  const item = specialLootConfig.items[Math.floor(Math.random() * specialLootConfig.items.length)];
  Inventory.addItemToPlayer(plyId, item.name, item.amount);
  fishingLogger.silly(`${plyId} received special loot for fishing`);
  Util.Log(
    'jobs:fishing:specialLoot',
    { groupId: group.id, item },
    `${Util.getName(plyId)}(${plyId}) received special loot for fishing`,
    plyId
  );
  return true;
};
