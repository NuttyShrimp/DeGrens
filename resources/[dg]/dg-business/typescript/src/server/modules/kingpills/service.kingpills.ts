import { Events, Notifications, Phone, Util, Inventory, Jobs } from '@dgx/server';
import { getBusinessByName } from 'services/business';
import { getExtraConfig } from 'services/config';
import { KINGPILLS_JOB_LOOT } from './constants.kingpills';

const activeJobs = new Map<
  string,
  {
    locationIdx: number;
    failTimeout: NodeJS.Timeout;
    enemyPed: number | null;
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
  const changedJob = Jobs.changeJobOfPlayerGroup(plyId, 'kingpills');
  if (!changedJob) return;

  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return; // should never happen because changeJob checks this but to keep ts happy

  const cid = Util.getCID(plyId);
  const business = getBusinessByName('kingpills');
  if (!business?.isEmployee(cid)) {
    Notifications.add(plyId, 'Je werkt hier niet', 'error');
    return;
  }

  const locations = getLocations();
  const locationIdx = getInactiveLocationIdx(locations);
  if (locationIdx === undefined) {
    Notifications.add(plyId, 'Er zijn geen jobs beschikbaar', 'error');
    return;
  }

  const failTimeout = setTimeout(() => {
    const active = activeJobs.get(group.id);
    if (!active) return;

    if (active.enemyPed) {
      DeleteEntity(active.enemyPed);
    }

    activeJobs.delete(group.id);
    Events.emitNet('business:kingpills:cleanup', plyId);
    Notifications.add(plyId, 'De opdracht is mislukt', 'error');
  }, 15 * 60 * 1000);

  activeJobs.set(group.id, {
    locationIdx,
    failTimeout,
    enemyPed: null,
  });

  Phone.sendMail(plyId, 'Nieuwe Job', 'King Pills', 'Bekijk je GPS om de joblocatie te bekijken.');
  Events.emitNet('business:kingpills:start', plyId, locations[locationIdx]);

  Util.Log(
    'kingpills:startJob',
    { locationIdx },
    `${Util.getName(plyId)}(${plyId}) has started a kingpills job`,
    plyId
  );
};

export const lootEnemy = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const active = activeJobs.get(group.id);
  if (!active) return;

  if (!active.enemyPed || !DoesEntityExist(active.enemyPed)) return;

  const locations = getLocations();
  const location = locations[active.locationIdx];
  if (!location) return;

  const plyCoords = Util.getPlyCoords(plyId);
  const enemyCoords = Util.getEntityCoords(active.enemyPed);
  if (Math.max(plyCoords.distance(location), enemyCoords.distance(location)) > 50) {
    Notifications.add(plyId, 'Je bent niet bij de locatie', 'error');
    return;
  }

  const itemName = KINGPILLS_JOB_LOOT[Math.floor(Math.random() * KINGPILLS_JOB_LOOT.length)];
  Inventory.addItemToPlayer(plyId, itemName, 1);

  Jobs.leaveGroup(plyId);
};

export const registerPedSpawned = (plyId: number, enemyNetId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const active = activeJobs.get(group.id);
  if (!active) return;

  const enemyPed = NetworkGetEntityFromNetworkId(enemyNetId);
  if (!enemyPed || !DoesEntityExist(enemyPed)) return;

  active.enemyPed = enemyPed;
  Entity(enemyPed).state.set('isKingPillsEnemy', true, true);
};

export const handleKingPillsJobLeave = (plyId: number | null, groupId: string) => {
  const active = activeJobs.get(groupId);
  if (!active) return;

  if (active.enemyPed) {
    DeleteEntity(active.enemyPed);
  }
  clearInterval(active.failTimeout);
  activeJobs.delete(groupId);

  if (plyId) {
    Events.emitNet('business:kingpills:cleanup', plyId);
  }

  Util.Log('kingpills:finish', {}, `finished kingpills job for group ${groupId}`, plyId ?? undefined);
};

export const restoreKingPillsJob = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const active = activeJobs.get(group.id);
  if (!active) return;

  Events.emitNet('business:kingpills:start', plyId, getLocations()[active.locationIdx]);
};

export const shouldKingPillsPedSpawn = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;
  const active = activeJobs.get(group.id);
  if (!active) return;

  return active.enemyPed === null;
};
