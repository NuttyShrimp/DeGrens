import { Events, Notifications, Vehicles, Util, Inventory, Financials, Config } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { changeJob, disbandGroup, getGroupByCid, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { BOAT_FOR_JOBTYPE } from './constants.fishing';
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
      min: 20,
      max: 40,
      groupPercent: 20,
    },
  });
};

const getRandomFishingLocationForJobType = (jobType: Fishing.JobType) => {
  const locations = fishingConfig.spots[jobType];
  return locations[Math.floor(Math.random() * locations.length)];
};

export const startJobForGroup = async (plyId: number, jobType: Fishing.JobType) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je zit niet in een groep', 'error');
    return;
  }

  const jobAssigned = changeJob(plyId, 'fishing');
  if (!jobAssigned) return;

  const vehicle = await Vehicles.spawnVehicle(BOAT_FOR_JOBTYPE[jobType], fishingConfig.vehicle[jobType], plyId);
  if (!vehicle) return;
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Vehicles.giveKeysToPlayer(plyId, netId);
  const vin = Vehicles.getVinForVeh(vehicle);
  if (vin !== null) {
    Vehicles.setFuelLevel(vin, 100);
  }

  if (jobType === 'boat') {
    global.exports['dg-misc'].toggleBoatAnchor(vehicle);
    Notifications.add(plyId, 'Vergeet de anker van de boot niet op te halen');
  }

  const location = getRandomFishingLocationForJobType(jobType);
  activeGroups.set(group.id, { netId, location, jobType, fishPerCid: new Map() });
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Events.emitNet('jobs:fishing:start', m.serverId, netId, location, jobType);
  });
};

export const syncFishingJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;
  fishingLogger.silly(`Syncing active job to plyId ${plyId}`);
  Events.emitNet('jobs:fishing:start', plyId, active.netId, active.location, active.jobType);
};

export const finishFishingJob = (plyId: number, netId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;
  if (active.netId !== netId) {
    Notifications.add(plyId, 'Dit is niet het gegeven visvoertuig', 'error');
    return;
  }

  disbandGroup(group.id);
  const payoutPerFish = jobManager.getJobPayout('fishing', group.members.length);
  if (payoutPerFish === null) {
    fishingLogger.error(`Could not get payout data for job`);
    return;
  }

  for (const [cid, fishAmount] of active.fishPerCid) {
    const player = DGCore.Functions.GetPlayerByCitizenId(cid);
    if (!player) {
      fishingLogger.warn(`Could not pay ${cid} for fishing, player is not in server`);
      continue;
    }
    Financials.addCash(player.PlayerData.source, fishAmount * payoutPerFish, 'fishing-payout');
  }

  Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  Util.Log('jobs:fishing:finish', { ...active }, `${Util.getName(plyId)} finished fishing for group`, plyId);
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
  if (active.netId !== netId) {
    Notifications.add(plyId, 'Dit is niet het gegeven visvoertuig', 'error');
    return;
  }
  const totalFishAmount = getTotalFishOfActive(active);
  const maxFishAmount = 10 * group.members.length;
  if (totalFishAmount + 1 >= maxFishAmount) {
    Notifications.add(
      plyId,
      'Het voertuig zit vol, lever het voertuig terug in om je betaling te ontvangen!',
      'success'
    );
    if (totalFishAmount + 1 > maxFishAmount) return;
  }
  const amountOfCid = active.fishPerCid.get(cid) ?? 0;
  active.fishPerCid.set(cid, amountOfCid + 1);
  activeGroups.set(group.id, active);
  fishingLogger.silly(`Fishamount for group ${group.id} has been increased by ${cid}`);
};

export const playerLeftGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:fishing:cleanup', plyId);
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;
  setTimeout(() => {
    Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  }, 10000);
  activeGroups.delete(groupId);
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
    `${Util.getName(plyId)} received special loot for fishing`,
    plyId
  );
  return true;
};
