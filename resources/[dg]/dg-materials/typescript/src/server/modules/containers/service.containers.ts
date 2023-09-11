import { Util, Gangs, Inventory, Police } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import config from 'services/config';
import {
  doesGangHaveContainerKey,
  fetchContainerKeyItems,
  updateContainerKeyGang,
  updateContainerKeyItemId,
} from './helpers.containers';
import { containersLogger } from './logger.containers';

const containers = new Map<string, Materials.Containers.Container>();
const containerForPlayer = new Map<number, string>();

export const loadContainers = async () => {
  const dbContainerBenches = await fetchContainerKeyItems();

  Object.entries(config.containers.containers).forEach(([containerId, containerConfig]) => {
    let data: Materials.Containers.Container;
    if (containerConfig.public) {
      data = { bench: containerConfig.bench, position: containerConfig.position, public: true };
    } else {
      const dbData = dbContainerBenches.find(x => x.containerId === containerId);
      let keyItemId: string | null = null;
      if (!dbData) {
        updateContainerKeyItemId(containerId, null);
      } else {
        keyItemId = dbData.keyItemId;
      }
      data = { bench: containerConfig.bench, position: containerConfig.position, public: false, keyItemId };
    }
    containers.set(containerId, data);
  });
};

export const getContainerById = (containerId: string) => {
  const container = containers.get(containerId);
  if (!container) {
    const logMsg = `Could not find data for container (${containerId})`;
    containersLogger.error(logMsg);
    Util.Log('materials:containers:invalidId', { containerId }, logMsg, undefined, true);
    return;
  }
  return container;
};

const getContainerNearCoords = (position: Vec3) => {
  const targetVector = Vector3.create(position);
  return Array.from(containers).find(([_, b]) => targetVector.distance(b.position) < 0.2);
};

export const getContainerIdNearPlayer = (plyId: number, targetPosition: Vec3) => {
  const foundContainer = getContainerNearCoords(targetPosition);
  if (!foundContainer) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to enter a container but was not near any valid one`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:notNearAny', { coords: targetPosition }, logMsg, plyId);
    return;
  }

  const [containerId, containerData] = foundContainer;

  const plyCoords = Util.getPlyCoords(plyId);
  if (plyCoords.distance(containerData.position) > 3) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to enter a container but provided invalid coords`;
    containersLogger.error(logMsg);
    Util.Log('materials:containers:invalidCoords', { coords: plyCoords }, logMsg, plyId, true);
    return;
  }
  return containerId;
};

export const canEnterContainer = async (plyId: number, containerId: string) => {
  const container = getContainerById(containerId);
  if (!container) return false;

  if (!Police.canDoActivity('bench_container_enter')) {
    const logMsg = `${Util.getName(
      plyId
    )}(${plyId}) tried to enter container (${containerId}) but not enough players in server`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:couldNotEnter', { containerId }, logMsg, plyId);
    return false;
  }

  if (container.public) return true;

  const keyItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'container_key');
  if (!keyItem) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to enter container (${containerId}) but did not have key`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:couldNotEnter', { containerId }, logMsg, plyId);
    return false;
  }

  if (container.keyItemId !== keyItem.id) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to enter container (${containerId}) but had the wrong key`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:couldNotEnter', { containerId }, logMsg, plyId);
    return false;
  }

  const cid = Util.getCID(plyId);
  if (!Gangs.isPlayerInGang(cid)) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to enter container (${containerId}) but is not in a gang`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:couldNotEnter', { containerId }, logMsg, plyId);
    return false;
  }

  return true;
};

export const registerPlayerInContainer = (plyId: number, targetPosition: Vec3) => {
  const [containerId] = getContainerNearCoords(targetPosition) ?? [];
  if (!containerId) return;
  const container = getContainerById(containerId);
  if (!container) return;

  containerForPlayer.set(plyId, containerId);

  if (!container.public) {
    const cid = Util.getCID(plyId);
    const gang = Gangs.getPlayerGangName(cid);
    if (gang) {
      updateContainerKeyGang(containerId, gang);
    } else {
      containersLogger.error(`Player ${cid} is not in a gang but entered a non-public container`);
    }
  }

  const logMsg = `${Util.getName(plyId)}(${plyId}) entered container (${containerId})`;
  containersLogger.silly(logMsg);
  Util.Log('materials:containers:entered', { containerId }, logMsg, plyId);
};

export const unregisterPlayerInContainer = (plyId: number) => {
  const containerId = containerForPlayer.get(plyId);
  containerForPlayer.delete(plyId);

  const logMsg = `${Util.getName(plyId)}(${plyId}) left container (${containerId})`;
  containersLogger.silly(logMsg);
  Util.Log('materials:containers:left', { containerId }, logMsg, plyId);
};

export const getContainerIdPlayerIsIn = (plyId: number) => {
  return containerForPlayer.get(plyId);
};

export const getContainerIdWhereKeyIs = (itemId: string | null) => {
  return Array.from(containers.keys()).find(containerId => {
    const container = getContainerById(containerId);
    if (!container) return false;
    if (container.public) return false;
    return container.keyItemId === itemId;
  });
};

export const linkContainerKeyItemId = async (containerId: string, itemId: string, gang?: string) => {
  const container = getContainerById(containerId);
  if (!container || container.public) return;
  containers.set(containerId, { ...container, keyItemId: itemId });
  await updateContainerKeyItemId(containerId, itemId);

  if (gang) {
    updateContainerKeyGang(containerId, gang);
  }
};

// Gives mold to player for container without key
export const tryGivingKeyMold = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const gang = Gangs.getPlayerGangName(cid);
  if (!gang) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) could not receive mold because he was not in a gang`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:noGangForMold', {}, logMsg, plyId);
    return;
  }

  const gangHasKey = await doesGangHaveContainerKey(gang);
  if (gangHasKey) {
    const logMsg = `${Util.getName(plyId)}(${plyId}) could not receive mold because his gang already has a key`;
    containersLogger.silly(logMsg);
    Util.Log('materials:containers:alreadyHasKey', {}, logMsg, plyId);
    return;
  }

  const containerId = getContainerIdWhereKeyIs(null);
  if (!containerId) return;
  const [moldItemId] = await Inventory.addItemToPlayer(plyId, 'key_mold', 1);
  setTimeout(() => {
    linkContainerKeyItemId(containerId, moldItemId, gang);
  }, 1000);
};
