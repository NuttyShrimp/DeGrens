import { Config, Events, Financials, Inventory, Notifications, Util, Vehicles, Phone } from '@dgx/server';
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
    // this is payout per bag player has done, 10 bags means * 10
    payout: {
      min: 14,
      max: 20,
      groupPercent: 25,
    },
  });
};

const buildPhoneNotificationData = (jobGroup: Sanitation.Job) => {
  const locationId: number | undefined = jobGroup.locationSequence[0];
  const isFinished =
    locationId === undefined ? true : jobGroup.dumpstersDone.length === sanitationConfig.locations[locationId].amount;

  const data = {
    title: isFinished
      ? 'Je bent klaar'
      : `${jobGroup.dumpstersDone.length}/${sanitationConfig.locations[locationId].amount} vuilniszakken`,
    description: isFinished
      ? 'Keer terug naar de vuilnisbelt'
      : `${sanitationConfig.amountOfLocationsPerJob - jobGroup.locationSequence.length}/${
          sanitationConfig.amountOfLocationsPerJob
        } locaties gedaan`,
  };

  return data;
};

const sendOutStartEvents = (
  plyId: number,
  jobGroup: Sanitation.Job,
  netId: number,
  phoneNotificationData: ReturnType<typeof buildPhoneNotificationData>
) => {
  Events.emitNet('jobs:sanitation:start', plyId, netId, sanitationConfig.vehicleLocation);

  const locationId = jobGroup.locationSequence[0];
  if (locationId !== undefined) {
    const location = sanitationConfig.locations[locationId];
    Events.emitNet('jobs:sanitation:setLocation', plyId, {
      id: locationId,
      coords: location.coords,
      range: location.range,
    });
  } else {
    Events.emitNet('jobs:sanitation:setLocation', plyId, null);
  }

  Phone.showNotification(plyId, {
    ...phoneNotificationData,
    id: 'sanitation_job_tracker',
    sticky: true,
    keepOnAction: true,
    icon: 'jobcenter',
  });
};

const generateLocationSequence = () => {
  const locationKeys = [...sanitationConfig.locations.keys()];
  return Util.shuffleArray(locationKeys).slice(0, sanitationConfig.amountOfLocationsPerJob);
};

export const startJobForGroup = async (plyId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) {
    Notifications.add(plyId, 'Je zit niet in een groep', 'error');
    return;
  }

  if (Util.isAnyVehicleInRange(sanitationConfig.vehicleLocation, 5)) {
    Notifications.add(plyId, 'Er staat een voertuig in de weg', 'error');
    return;
  }

  const jobAssigned = changeJob(group.id, 'sanitation');
  if (!jobAssigned) return;
  const payoutLevel = jobManager.getJobPayoutLevel('sanitation');
  if (!payoutLevel) return;

  const spawnedVehicle = await Vehicles.spawnVehicle({
    model: 'trash',
    position: sanitationConfig.vehicleLocation,
    keys: plyId,
    fuel: 100,
  });
  if (!spawnedVehicle) {
    Notifications.add(plyId, 'Kon het voertuig niet uithalen', 'error');
    return;
  }
  const { vehicle, netId, vin } = spawnedVehicle;

  const locationSequence = generateLocationSequence();
  const jobGroup: Sanitation.Job = {
    vin,
    locationSequence,
    dumpstersDone: [],
    bagsPerPlayer: new Map(),
    payoutLevel,
  };
  activeGroups.set(group.id, jobGroup);

  Util.Log(
    'jobs:sanitation:start',
    {
      groupId: group.id,
      vin,
      netId,
      locationSequence,
    },
    `${Util.getName(plyId)}(${plyId}) started sanitation job for group`,
    plyId
  );

  const phoneNotificationData = buildPhoneNotificationData(jobGroup);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    sendOutStartEvents(m.serverId, jobGroup, netId, phoneNotificationData);
  });
};

export const syncSanitationJobToClient = (groupId: string, plyId: number) => {
  const active = activeGroups.get(groupId);
  if (active === undefined) return;

  const netId = Vehicles.getNetIdOfVin(active.vin);
  if (!netId) {
    Notifications.add(plyId, 'Het jobvoertuig bestaat niet', 'error');
    return;
  }

  sanitationLogger.silly(`Syncing active job to plyId ${plyId}`);
  const phoneNotificationData = buildPhoneNotificationData(active);

  sendOutStartEvents(plyId, active, netId, phoneNotificationData);
};

export const finishJobForGroup = (plyId: number, netId: number) => {
  const group = getGroupByServerId(plyId);
  if (!group) return;
  const active = activeGroups.get(group.id);
  if (!active) return;

  const vin = Vehicles.getVinForNetId(netId);
  if (active.vin !== vin) {
    Notifications.add(plyId, 'Dit is niet de gegeven vuilkar', 'error');
    return;
  }

  const payoutPerBag = jobManager.getJobPayout('sanitation', group.size, active.payoutLevel) ?? 0;
  group.members.forEach(m => {
    if (m.serverId === null) return;

    const amount = active.bagsPerPlayer.get(m.cid);
    if (!amount) return;
    const plyMultiplier = jobManager.getPlayerAmountOfJobsFinishedMultiplier(m.cid);
    Financials.addCash(m.serverId, payoutPerBag * amount * plyMultiplier, 'sanitation-payout');
  });

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  Vehicles.deleteVehicle(vehicle);

  disbandGroup(group.id);
  Util.Log(
    'jobs:sanitation:finish',
    {
      groupId: group.id,
      bagsPerPlayer: [...active.bagsPerPlayer.entries()],
    },
    `${Util.getName(plyId)}(${plyId}) finished sanitation for group`,
    plyId
  );
};

export const handlePlayerLeftSanitationGroup = (groupId: string, plyId: number | null) => {
  const active = activeGroups.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('jobs:sanitation:cleanup', plyId);
  }

  // if still players inside group do nothing
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
  sanitationLogger.silly(`Group ${groupId} has been removed from active as there are no members remaining`);
};

export const takeBagFromDumpster = (plyId: number, dumpsterLocation: Vec3) => {
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

  const locationId: number | undefined = active.locationSequence[0];
  if (locationId === undefined) return false;

  const dumpster = Vector3.create(dumpsterLocation);
  const targetLocation = sanitationConfig.locations[locationId];

  // Check if dumpster is not out of range of targetlocation
  if (dumpster.distance(targetLocation.coords) > targetLocation.range) return false;

  // Check if dumpster wasnt already done
  if (active.dumpstersDone.some(d => dumpster.distance(d) < 0.5)) return false;

  // Check if all bags have already been taken
  if (active.dumpstersDone.length === targetLocation.amount) return false;

  active.dumpstersDone.push(dumpsterLocation);

  // Check if no bags remaining after tagging dumpster as done
  let finishedLocation = false;
  let newLocationId: number | undefined;
  if (active.dumpstersDone.length === targetLocation.amount) {
    active.locationSequence.shift();
    active.dumpstersDone = [];
    newLocationId = active.locationSequence[0];
    finishedLocation = true;
  }

  const phoneNotifData = buildPhoneNotificationData(active);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Phone.updateNotification(m.serverId, 'sanitation_job_tracker', phoneNotifData);

    if (finishedLocation) {
      if (newLocationId !== undefined) {
        const location = sanitationConfig.locations[newLocationId];
        Events.emitNet('jobs:sanitation:setLocation', m.serverId, {
          id: newLocationId,
          coords: location.coords,
          range: location.range,
        });
      } else {
        Events.emitNet('jobs:sanitation:setLocation', m.serverId, null);
      }
    }
  });

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

  // Handle loot chance
  if (Util.getRndInteger(1, 101) < sanitationConfig.lootChance) {
    let items: string[];
    if (Util.getRndInteger(1, 101) === 1) {
      items = [...sanitationConfig.specialLoot];
    } else {
      items = [...sanitationConfig.loot];
    }
    Inventory.addItemToPlayer(plyId, items[Math.floor(Math.random() * items.length)], 1);
  }

  // Save amount of bags done
  const cid = Util.getCID(plyId);
  const amountOfPackages = active.bagsPerPlayer.get(cid) ?? 0;
  active.bagsPerPlayer.set(cid, amountOfPackages + 1);
};

export const skipCurrentLocation = (plyId: number) => {
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

  if (active.locationSequence[0] === undefined) return;

  active.locationSequence.shift();
  active.dumpstersDone = [];
  const newLocationId = active.locationSequence[0];

  const phoneNotifData = buildPhoneNotificationData(active);
  group.members.forEach(m => {
    if (m.serverId === null) return;
    Phone.updateNotification(m.serverId, 'sanitation_job_tracker', phoneNotifData);

    if (newLocationId !== undefined) {
      const location = sanitationConfig.locations[newLocationId];
      Events.emitNet('jobs:sanitation:setLocation', m.serverId, {
        id: newLocationId,
        coords: location.coords,
        range: location.range,
      });
    } else {
      Events.emitNet('jobs:sanitation:setLocation', m.serverId, null);
    }
  });
};
