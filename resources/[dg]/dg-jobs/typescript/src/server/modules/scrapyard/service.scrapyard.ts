import { Events, Notifications, Phone, Util, Vehicles, Inventory, RPC, Config, Npcs } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { changeJob, disbandGroup, getGroupById, getGroupByServerId } from 'modules/groups/service';
import { scrapyardLogger } from './logger.scrapyard';
import { PED_MODELS } from './constants.scrapyard';

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

  const jobAssigned = changeJob(group.id, 'scrapyard');
  if (!jobAssigned) return;

  const model = getRandomModel();
  const spawnedVehicle = await Vehicles.spawnVehicle({
    model,
    position: location.vehicleLocation,
  });
  if (!spawnedVehicle) {
    Notifications.add(ownerId, 'Kon het voertuig niet uithalen', 'error');
    return;
  }
  const { vehicle, netId, vin } = spawnedVehicle;

  Vehicles.setVehicleDoorsLocked(vehicle, true);

  activeGroups.set(group.id, {
    ...location,
    vin,
    pedSpawned: false,
    doorsDone: [],
  });

  Util.Log(
    'jobs:scrapyard:start',
    {
      groupId: group.id,
    },
    `${Util.getName(ownerId)}(${ownerId}) started scrapyard job for group`,
    ownerId
  );
  scrapyardLogger.info(`Assigned a scrapyard job to group owner ${ownerId} | group ${group.id}`);

  group.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:scrapyard:startJob', member.serverId, netId, location.vehicleLocation);
    Phone.addMail(member.serverId, {
      subject: 'Voertuig Opdracht',
      sender: 'Scrapyard Inc.',
      message:
        'Het gevraagde voertuig staat op je GPS. Gelieve het voertuig naar deze werkplaats te brengen. Eenmaal je hier bent kan je bepaalde onderdelen demonteren. Geef me daarna de onderdelen om de opdracht af te ronden.',
    });
  });
};

export const handleVehicleLockpick = async (plyId: number, vehicle: number) => {
  const plyGroup = getGroupByServerId(plyId);
  if (!plyGroup) return;
  const job = activeGroups.get(plyGroup.id);
  if (!job || job.pedSpawned) return;

  const vin = Vehicles.getVinForVeh(vehicle);
  if (vin !== job.vin) return;

  Npcs.spawnGuard({
    model: PED_MODELS[Math.floor(Math.random() * PED_MODELS.length)],
    position: job.pedLocation,
    deleteTime: {
      default: 180,
      onDead: 30,
    },
  });

  activeGroups.set(plyGroup.id, { ...job, pedSpawned: true });

  plyGroup.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:scrapyard:removeBlip', member.serverId);
  });
};

export const getLootFromVehicle = (plyId: number, netId: number, doorId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) {
    scrapyardLogger.warn(`Player ${plyId} tried to get loot for invalid vin: ${vin}`);
    return;
  }

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  SetVehicleDoorBroken(vehicle, doorId, true);

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

  // Getting doorstates in that function suffers from latency when removing door in this function so we wait a few sec
  setTimeout(() => {
    tryToFinishJob(plyId);
  }, 2000);
};

const tryToFinishJob = async (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const netId = Vehicles.getNetIdOfVin(active.vin);
  if (!netId) {
    Notifications.add(plyId, 'Kon het voertuig niet vinden', 'error');
    return;
  }

  const doorStates = await Util.sendRPCtoEntityOwner<boolean[]>(
    NetworkGetEntityFromNetworkId(netId),
    'vehicles:client:getDoorState',
    netId
  );
  if (!doorStates) return;
  const allDoorsOff = doorStates.every(s => s);

  // If all are off then group is finished!
  if (active.doorsDone.length === 6 || allDoorsOff) {
    disbandGroup(group.id);

    Util.Log(
      'jobs:scrapyard:finish',
      {
        groupId: group.id,
      },
      `${Util.getName(plyId)}(${plyId}) finished scrapyard job for group`,
      plyId
    );
  }
};

export const getDonePartsForGroup = (groupId: string, netId: number) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) return;

  return active.doorsDone;
};

export const syncScrapyardJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;

  const netId = Vehicles.getNetIdOfVin(active.vin);
  if (!netId) {
    Notifications.add(plyId, 'Het jobvoertuig bestaat niet', 'error');
    return;
  }

  scrapyardLogger.silly(`Syncing active job to plyId ${plyId}`);
  Events.emitNet('jobs:scrapyard:startJob', plyId, netId, !active.pedSpawned ? active.vehicleLocation : undefined);
};

export const handlePlayerLeftScrapyardGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:scrapyard:cleanup', plyId);
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
    5000,
    active.vin
  );
  scrapyardLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};
