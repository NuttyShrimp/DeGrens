import { Events, Jobs, Notifications, Phone, Util, Vehicles, Inventory, RPC, Config } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { changeJob, disbandGroup, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { scrapyardLogger } from './logger.scrapyard';

let scrapyardConfig: Scrapyard.Config;
export const getScrapyardConfig = () => scrapyardConfig;
const activeGroups = new Map<string, Scrapyard.Job>();

export const initializeScrapyard = () => {
  scrapyardConfig = Config.getConfigValue('jobs').scrapyard;
  jobManager.registerJob('scrapyard', {
    title: 'Scrapyard',
    size: 3,
    legal: true,
    icon: 'car-burst',
    location: { x: 2339.48, y: 3056.19 },
  });
};

const getNonBusyLocation = () => {
  const locations = scrapyardConfig.locations;
  let chosenIndex: number | null = null;
  const busyIds = Array.from(activeGroups.values()).map(b => b.id);
  let timesTried = 0;
  while (chosenIndex === null) {
    timesTried++;
    if (timesTried > 25) return;
    const index = Math.floor(Math.random() * locations.length);
    if (!busyIds.includes(index) && !Util.isAnyVehicleInRange(locations[index].vehicleLocation, 3)) {
      chosenIndex = index;
    }
  }
  return { ...locations[chosenIndex], id: chosenIndex };
};

const getRandomModel = () => {
  const models = scrapyardConfig.models;
  const index = Math.floor(Math.random() * models.length);
  return models[index];
};

export const assignLocationToGroup = async (ownerId: number) => {
  const group = getGroupByServerId(ownerId);
  if (!group) {
    Notifications.add(ownerId, 'Je zit niet in een groep!', 'error');
    return;
  }

  const location = getNonBusyLocation();
  if (!location) {
    Notifications.add(ownerId, 'Ik heb geen opdracht voor je', 'error');
    return;
  }

  const jobAssigned = changeJob(ownerId, 'scrapyard');
  if (!jobAssigned) return;

  const model = getRandomModel();
  const vehicle = await Vehicles.spawnVehicle(model, location.vehicleLocation, ownerId);
  if (!vehicle || !group) {
    Notifications.add(ownerId, 'Er is een probleem opgetreden', 'error');
    return;
  }
  SetVehicleDoorsLocked(vehicle, 2);

  const vehicleNetId = NetworkGetNetworkIdFromEntity(vehicle);
  activeGroups.set(group.id, { ...location, netId: vehicleNetId, pedSpawned: false, doorsDone: [] });
  group.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:scrapyard:startJob', member.serverId, vehicleNetId, location.vehicleLocation);
    Phone.sendMail(
      member.serverId,
      'Voertuig Opdracht',
      'Scrapyard Inc.',
      'Het gevraagde voertuig staat op je GPS. Gelieve het voertuig naar deze werkplaats te brengen. Eenmaal je hier bent kan je bepaalde onderdelen demonteren. Geef me daarna de onderdelen om de opdracht af te ronden.'
    );
  });
  scrapyardLogger.info(`Assigned a scrapyard job to group owner ${ownerId} | group ${group.id}`);
};

export const handleVehicleLockpick = (plyId: number, vehicle: number) => {
  const plyGroup = getGroupByServerId(plyId);
  if (!plyGroup) return;
  const job = activeGroups.get(plyGroup.id);
  if (!job || job.netId !== NetworkGetNetworkIdFromEntity(vehicle)) return;
  if (job.pedSpawned) return;
  Events.emitNet('jobs:scrapyard:spawnPed', plyId, job.pedLocation);
  activeGroups.set(plyGroup.id, { ...job, pedSpawned: true });
};

export const getLootFromVehicle = (plyId: number, netId: number, doorId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active || active.netId !== netId) {
    scrapyardLogger.warn(`Player ${plyId} tried to get loot for invalid netid: ${netId}`);
    return;
  }

  SetVehicleDoorBroken(NetworkGetEntityFromNetworkId(netId), doorId, true);

  if (active.doorsDone.includes(doorId)) {
    Notifications.add(plyId, 'Dit onderdeel is er al afgehaald', 'error');
    scrapyardLogger.warn(`Player ${plyId} tried to get get loot for door ${doorId} but door was already looted`);
    return;
  }

  let itemName: string;
  if ([0, 1, 2, 3].includes(doorId)) {
    itemName = 'vehicle_door';
  } else if (doorId === 4) {
    itemName = 'vehicle_bonnet';
  } else if (doorId === 5) {
    itemName = 'vehicle_boot';
  } else {
    scrapyardLogger.warn(`Player ${plyId} tried to get loot for invalid doorid: ${doorId}`);
    return;
  }

  Inventory.addItemToPlayer(plyId, itemName, 1);
  scrapyardLogger.info(`Player ${plyId} received loot for vehicle ${netId} | door ${doorId}`);
  activeGroups.set(group.id, { ...active, doorsDone: [...active.doorsDone, doorId] });

  tryToFinishJob(plyId);
};

const tryToFinishJob = async (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const doorStates = await RPC.execute<boolean[]>('vehicles:client:getDoorSate', plyId, active.netId);
  if (!doorStates) return;
  const allDoorsOff = doorStates?.every(s => s === true);

  if (active.doorsDone.length === 6 || allDoorsOff) {
    setTimeout(() => {
      disbandGroup(group.id);
    }, 1000);
    setTimeout(() => {
      Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
    }, 10000);
  }
};

export const getDonePartsForGroup = (groupId: string, netId: number) => {
  const active = activeGroups.get(groupId);
  if (!active || active.netId !== netId) return;
  return active.doorsDone;
};

export const syncScrapyardJobToClient = (groupId: string, plyId: number, cid: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;
  scrapyardLogger.silly(`Syncing active job to plyId ${plyId} | cid ${cid}`);
  Events.emitNet('jobs:scrapyard:startJob', plyId, active.netId, active.vehicleLocation);
};

export const playerLeftGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:scrapyard:cleanup', plyId);
  }

  const group = getGroupById(groupId);
  if (group && group.members.length > 0) return;
  setTimeout(() => {
    Vehicles.deleteVehicle(NetworkGetEntityFromNetworkId(active.netId));
  }, 10000);
  activeGroups.delete(groupId);
  scrapyardLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};
