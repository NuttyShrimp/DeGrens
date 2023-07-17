import { Events, Notifications, Phone, Util, Inventory, Jobs, Npcs, Taskbar } from '@dgx/server';
import { getBusinessByName } from 'services/business';
import { getExtraConfig } from 'services/config';
import { KINGPILLS_JOB_LOOT } from './constants.kingpills';

const activeJobs = new Map<
  string,
  {
    locationIdx: number;
    pedSpawned: boolean;
    isLooted: boolean;
  }
>();

const getLocations = () => getExtraConfig<KingPills.Config>('kingpills')?.locations ?? [];

const getInactiveLocationIdx = (locations: KingPills.Config['locations']) => {
  const activeLocationIdxs = [...activeJobs.values()].map(v => v.locationIdx);

  let tries = locations.length;
  while (tries > 0) {
    const idx = Math.floor(Math.random() * locations.length);
    if (!activeLocationIdxs.includes(idx)) {
      return idx;
    }
    tries--;
  }
};

export const registerKingPillsJob = () => {
  Jobs.registerJob('kingpills', {
    title: 'KingPills Job',
    icon: 'pills',
    legal: false,
    size: 1,
  });
};

export const startKingPillsJob = (plyId: number) => {
  const cid = Util.getCID(plyId);
  const business = getBusinessByName('kingpills');
  if (!business?.isEmployee(cid)) {
    Notifications.add(plyId, 'Je werkt hier niet', 'error');
    return;
  }

  const changedJob = Jobs.changeJobOfPlayerGroup(plyId, 'kingpills');
  if (!changedJob) return;

  assignLocationForKingPillsJob(plyId);

  Phone.addMail(plyId, {
    subject: 'Nieuwe Job',
    sender: 'King Pills',
    message:
      'Bekijk je GPS om de ophaallocatie te bekijken.<br>Na de spullen op te halen krijg je automatisch een nieuwe locatie.<br>Je kan de job stoppen door je groep te verlaten',
  });
};

const assignLocationForKingPillsJob = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const locations = getLocations();
  const locationIdx = getInactiveLocationIdx(locations);
  if (locationIdx === undefined) {
    Notifications.add(plyId, 'Er zijn geen jobs meer beschikbaar', 'error');
    activeJobs.delete(group.id);
    group.members.forEach(member => {
      if (!member.serverId) return;
      Events.emitNet('business:kingpills:destroy', member.serverId);
    });
    return;
  }

  activeJobs.set(group.id, {
    locationIdx,
    pedSpawned: false,
    isLooted: false,
  });

  const location = locations[locationIdx];
  group.members.forEach(member => {
    if (!member.serverId) return;
    Events.emitNet('business:kingpills:build', plyId, location);
  });

  Util.Log(
    'kingpills:doJob',
    { location },
    `${Util.getName(plyId)}(${plyId}) has received a kingpills job location`,
    plyId
  );
};

export const lootEnemy = async (plyId: number, enemyNetId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const active = activeJobs.get(group.id);
  if (!active || !active.pedSpawned) return;

  const enemyPed = NetworkGetEntityFromNetworkId(enemyNetId);
  if (!enemyPed || !DoesEntityExist(enemyPed)) return;
  if (!Entity(enemyPed).state.isKingPillsEnemy) return;

  const location = getLocations()[active.locationIdx];
  if (!location) return;

  const plyCoords = Util.getPlyCoords(plyId);
  const enemyCoords = Util.getEntityCoords(enemyPed);
  if (Math.max(plyCoords.distance(location), enemyCoords.distance(location)) > 50) {
    Notifications.add(plyId, 'Je bent niet bij de locatie', 'error');
    return;
  }

  if (active.isLooted) return;

  active.isLooted = true;
  const [canceled] = await Taskbar.create(plyId, 'magnifying-glass', 'Doorzoeken', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (canceled) {
    active.isLooted = false;
    return;
  }

  const itemName = KINGPILLS_JOB_LOOT[Math.floor(Math.random() * KINGPILLS_JOB_LOOT.length)];
  Inventory.addItemToPlayer(plyId, itemName, 1);

  assignLocationForKingPillsJob(plyId);
};

export const handleKingPillsJobLeave = (plyId: number | null, groupId: string) => {
  const active = activeJobs.get(groupId);
  if (!active) return;

  if (plyId) {
    Events.emitNet('business:kingpills:destroy', plyId);
  }

  const group = Jobs.getGroupById(groupId);
  if (group && group.members.length > 0) return;

  activeJobs.delete(groupId);

  Util.Log('kingpills:finish', {}, `finished kingpills job for group ${groupId}`, plyId ?? undefined);
};

export const restoreKingPillsJob = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const active = activeJobs.get(group.id);
  if (!active) return;

  Events.emitNet('business:kingpills:build', plyId, getLocations()[active.locationIdx]);
};

export const handleKingPillsPickupEnter = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;
  const active = activeJobs.get(group.id);
  if (!active || active.pedSpawned) return;
  const position = getLocations()[active.locationIdx];
  if (!position) return;

  Npcs.spawnGuard({
    model: 'a_m_m_hillbilly_02',
    position,
    heading: Util.getHeadingToFaceCoordsFromCoord(position, Util.getPlyCoords(plyId)),
    weapon: 'WEAPON_KNIFE',
    flags: {
      isKingPillsEnemy: true,
    },
    deleteTime: {
      alive: 180,
      dead: 30,
    },
  });
  Notifications.add(plyId, 'Je hoort iemand roepen');

  active.pedSpawned = true;

  group.members.forEach(member => {
    if (!member.serverId) return;
    Events.emitNet('business:kingpills:destroy', member.serverId);
  });
};
