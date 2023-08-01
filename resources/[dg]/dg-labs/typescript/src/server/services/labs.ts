import repository from 'classes/repository';
import config from './config';
import { mainLogger } from 'sv_logger';
import { Admin, DoorLock, Events, Util } from '@dgx/server';
import { DEFAULT_DB_LABS } from '../constants';

let labsLoaded = false;
const activeLabs = {} as Record<Labs.Type, Labs.ActiveLab>;
const insidePlayers: Record<number, Set<number>> = {};

export const initiateLabs = async () => {
  const dbLabs = await repository.getActiveLabs();

  // we use string or ts will complain that key is not present
  const refreshTimesPerType: Record<string, number> = {};

  // we init old states to be able to properly generate new ids if we want to refresh
  // because default is first, if db data is present, it will get overwritten
  for (const dbLab of [...DEFAULT_DB_LABS, ...dbLabs]) {
    const { type, refreshTime, id } = dbLab;

    refreshTimesPerType[type] = refreshTime;
    activeLabs[type] = buildActiveLabData(type, id);
  }

  // Check if any need to be refreshed
  const currentTime = Date.now() / 1000;
  for (const type of Object.keys(activeLabs) as Labs.Type[]) {
    const refreshTime = refreshTimesPerType[type] ?? 0;
    if (refreshTime > currentTime) continue;

    let newId: number | null = null;
    const idsToTry = Util.shuffleArray([...new Array(config.locations.length)].map((_, i) => i));
    while (newId === null && idsToTry.length > 0) {
      const id = idsToTry.pop();
      if (getLabTypeFromId(id)) continue; // check if generated id isnt already an active lab
      if (!config.locations[id].allowedTypes.includes(type)) continue; // check if location allows this interior type
      newId = id;
    }

    if (newId === null) {
      mainLogger.error(`Could not find a new id for ${type}lab`);
      continue;
    }

    activeLabs[type] = buildActiveLabData(type, newId);
    const refreshTimeout = config.interiors[type].refreshTimeout;
    repository.updateActiveLab(type, newId, currentTime + refreshTimeout * 24 * 60 * 60);
    mainLogger.info(`Refreshed ${type}lab to labId ${newId}`);
  }

  // Open doors of active
  for (const type of Object.keys(activeLabs) as Labs.Type[]) {
    const data = activeLabs[type];
    DoorLock.changeDoorState(config.locations[data.id].doorId, false);
  }

  labsLoaded = true;
};

export const getLabTypeFromId = (id: number) => {
  for (const type of Object.keys(activeLabs) as Labs.Type[]) {
    if (activeLabs[type].id === id) {
      return type;
    }
  }
};

const buildActiveLabData = (type: Labs.Type, id: number): Labs.ActiveLab => {
  return {
    id: id,
    ...config.locations[id],
    ...config.interiors[type],
  };
};

export const lockAllLabs = () => {
  for (const type in activeLabs) {
    const data = activeLabs[type as Labs.Type];
    const doorId = config.locations[data.id].doorId;
    DoorLock.changeDoorState(doorId, false);
  }
};

export const getActiveLabs = () => {
  if (!labsLoaded) return;
  return activeLabs;
};

export const awaitLabsLoaded = () => Util.awaitCondition(() => labsLoaded);

export const handlePlayerEnteredLab = (plyId: number, labId: number) => {
  const type = getLabTypeFromId(labId);
  if (!type) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) has entered lab ${labId} but it is not active`;
    mainLogger.silly(logMsg);
    Util.Log('labs:nonActiveLab', { labId }, logMsg, plyId);
    return;
  }

  const plys = (insidePlayers[labId] ??= new Set());
  plys.add(plyId);

  Events.emitNet('labs:client:buildLabZones', plyId, type, labId, config.interiors[type].peekZones);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has entered lab ${labId} (currently ${type ?? 'not active'})`;
  mainLogger.silly(logMsg);
  Util.Log('labs:entered', { type, labId }, logMsg, plyId);
};

export const handlePlayerLeftLab = (plyId: number, labId: number) => {
  const type = getLabTypeFromId(labId);
  if (!type) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) has entered lab ${labId} but it is not active`;
    mainLogger.silly(logMsg);
    Util.Log('labs:nonActiveLab', { labId }, logMsg, plyId);
    return;
  }

  const plys = insidePlayers[labId];
  if (!plys) return;
  plys.delete(plyId);

  // only send if online
  if (Util.getName(plyId)) {
    Events.emitNet('labs:client:destroyLabZones', plyId, labId);
  }

  const logMsg = `${Util.getName(plyId)}(${plyId}) has left lab ${labId} (currently ${type ?? 'not active'})`;
  mainLogger.silly(logMsg);
  Util.Log('labs:left', { type, labId }, logMsg, plyId);
};

export const getLabIdPlayerIsIn = (plyId: number) => {
  for (const key in insidePlayers) {
    const labId = Number(key);
    const plys = insidePlayers[labId];
    if (plys && plys.has(plyId)) {
      return labId;
    }
  }
};

export const debugInsidePlayers = () => {
  let msg = Object.entries(insidePlayers)
    .map(([type, plys]) => `Players in lab ${type}: ${[...plys.values()].join(', ')}`)
    .join('\n');
  console.log(msg);
};

export const validateLabType = (plyId: number, labId: number, type: Labs.Type) => {
  const expectedType = getLabTypeFromId(labId);
  if (expectedType !== type) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to do lab action in incorrect lab`;
    mainLogger.warn(logMsg);
    Util.Log('labs:invalidLab', { labId, expectedType, providedType: type }, logMsg, plyId, true);
    Admin.ACBan(plyId, 'Invalid Lab Action', { labId, expectedType, providedType: type });
    return false;
  }
  return true;
};
