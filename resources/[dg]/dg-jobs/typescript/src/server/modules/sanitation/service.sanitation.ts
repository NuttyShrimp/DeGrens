import { Config, Events, Inventory, Notifications, Util, Vehicles, Phone, UI, Financials } from '@dgx/server';
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
    // this is amount of money for 1 bucket, 10 bags means * 10
    payout: {
      min: 18,
      max: 36,
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
  const { netId, vin } = spawnedVehicle;

  const locationSequence = generateLocationSequence();
  const jobGroup: Sanitation.Job = {
    vin,
    locationSequence,
    dumpstersDone: [],
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

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  Vehicles.deleteVehicle(vehicle);

  disbandGroup(group.id);
  Util.Log(
    'jobs:sanitation:finish',
    {
      groupId: group.id,
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

  const cid = Util.getCID(plyId);
  const bucketPrice = jobManager.getJobPayout('sanitation', group.size, active.payoutLevel) ?? 0;
  const plyMultiplier = jobManager.getPlayerAmountOfJobsFinishedMultiplier(cid);
  Inventory.addItemToPlayer(plyId, 'sanitation_material_bucket', 1, {
    hiddenKeys: ['price'],
    price: bucketPrice * plyMultiplier,
  });
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

export const openSanitationRecycleMenu = async (plyId: number) => {
  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Recycleer Materiaal',
      icon: 'fas fa-recycle',
      description: 'Kies wat je met je recycleerbaar materiaal wil doen',
      disabled: true,
    },
    {
      title: 'Verkoop',
      icon: 'fas fa-dollar-sign',
      submenu: [
        {
          title: 'Verkoop 1',
          callbackURL: 'sanitation/recycle',
          data: {
            action: 'sell',
            all: false,
          },
          preventCloseOnClick: true,
        },
        {
          title: 'Verkoop alle',
          callbackURL: 'sanitation/recycle',
          data: {
            action: 'sell',
            all: true,
          },
        },
      ],
    },
  ];

  for (let i = 0; i < sanitationConfig.recycleItems.length; i++) {
    const recycleItem = sanitationConfig.recycleItems[i];
    const itemLabel = Inventory.getItemData(recycleItem.name)?.label ?? 'Onbekend';
    menuEntries.push({
      title: itemLabel,
      callbackURL: 'sanitation/recycle',
      description: `Zet om naar ${recycleItem.amount}x ${itemLabel}`,
      submenu: [
        {
          title: '1 omzetten',
          callbackURL: 'sanitation/recycle',
          data: {
            action: 'convert',
            itemIdx: i,
            all: false,
          },
          preventCloseOnClick: true,
        },
        {
          title: 'Alle omzetten',
          callbackURL: 'sanitation/recycle',
          data: {
            action: 'convert',
            itemIdx: i,
            all: true,
          },
        },
      ],
    });
  }

  UI.openContextMenu(plyId, menuEntries);
};

export const doSanitationRecycleAction = async (
  plyId: number,
  action: 'sell' | 'convert',
  all: boolean,
  itemIdx?: number
) => {
  // itemIdx can be serialized to null bcs yey
  if (action !== 'sell' && !(action === 'convert' && itemIdx != undefined)) return;

  const bucketItems = await Inventory.getItemsWithNameOfPlayer<{ price: number }>(plyId, 'sanitation_material_bucket');
  if (bucketItems.length === 0) {
    Notifications.add(plyId, 'Je hebt geen recycleerbaar materiaal', 'error');
    return;
  }

  const removed = await Inventory.removeItemsByIdsFromPlayer(
    plyId,
    all ? bucketItems.map(i => i.id) : [bucketItems[0].id]
  );
  if (!removed) {
    Notifications.add(plyId, 'Je hebt geen recycleerbaar materiaal', 'error');
    return;
  }

  if (action === 'sell') {
    let price = 0;
    if (all) {
      price = bucketItems.reduce((acc, cur) => acc + (cur.metadata.price ?? 0), 0);
    } else {
      price = bucketItems[0].metadata.price ?? 0;
    }
    Financials.addCash(plyId, price, 'sanitation-sell-bucket');
  } else {
    const amount = all ? bucketItems.length : 1;
    const recycleItem = sanitationConfig.recycleItems[itemIdx!];
    Inventory.addItemToPlayer(plyId, recycleItem.name, recycleItem.amount * amount);
  }
};
