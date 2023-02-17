import { Util, Gangs, Inventory, Police } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { getConfig } from 'services/config';
import { fetchContainerKeyItems, updateContainerKeyItemId } from './helpers.containers';
import { containersLogger } from './logger.containers';

const containers = new Map<string, Materials.Containers.Container>();
const containerForPlayer = new Map<number, string>();

export const loadContainers = async () => {
  const dbContainerBenches = await fetchContainerKeyItems();

  Object.entries(getConfig().containers.containers).forEach(([containerId, containerConfig]) => {
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
    containersLogger.error(`Could not find data for container (${containerId})`);
    Util.Log(
      'materials:containers:invalidId',
      { id: containerId },
      `Could not find data for container (${containerId})`,
      undefined,
      true
    );
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
  if (!foundContainer) return;
  const [containerId, containerData] = foundContainer;

  const plyCoords = Util.getPlyCoords(plyId);
  if (plyCoords.distance(containerData.position) > 3) {
    containersLogger.error(`Tried to enter but was not near any container`);
    Util.Log(
      'materials:containers:notNear',
      { coords: plyCoords },
      `Tried to enter but was not near any container`,
      plyId,
      true
    );
    return;
  }
  return containerId;
};

export const canEnterContainer = async (plyId: number, containerId: string) => {
  const container = getContainerById(containerId);
  if (!container) return false;

  const cid = Util.getCID(plyId);

  if (!Police.canDoActivity('bench_container_enter')) {
    containersLogger.silly(`${cid} tried to enter container (${containerId}) but not enough players in server`);
    Util.Log(
      'materials:containers:couldNotEnter',
      { id: containerId },
      `${Util.getName(plyId)} tried to enter container (${containerId}) but not enough players in server`,
      plyId
    );
    return false;
  }

  if (container.public) return true;

  const keyItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'container_key');
  if (!keyItem) {
    containersLogger.silly(`${cid} tried to enter container (${containerId}) but did not have key`);
    Util.Log(
      'materials:containers:couldNotEnter',
      { id: containerId },
      `${Util.getName(plyId)} tried to enter container (${containerId}) but did not have key`,
      plyId
    );
    return false;
  }

  if (container.keyItemId !== keyItem.id) {
    containersLogger.silly(`${cid} tried to enter container (${containerId}) but had the wrong key`);
    Util.Log(
      'materials:containers:couldNotEnter',
      { id: containerId },
      `${Util.getName(plyId)} tried to enter container (${containerId}) but had the wrong key`,
      plyId
    );
    return false;
  }

  const isInGang = await Gangs.getPlayerGang(cid);
  if (!isInGang) {
    containersLogger.silly(`${cid} tried to enter container (${containerId}) but is not in a gang`);
    Util.Log(
      'materials:containers:couldNotEnter',
      { id: containerId },
      `${Util.getName(plyId)} tried to enter container (${containerId}) but is not in a gang`,
      plyId
    );
    return false;
  }

  return true;
};

export const registerPlayerInContainer = (plyId: number, targetPosition: Vec3) => {
  const [containerId] = getContainerNearCoords(targetPosition) ?? [];
  if (!containerId) return;
  const cid = Util.getCID(plyId);
  containerForPlayer.set(cid, containerId);

  containersLogger.silly(`CID ${cid} entered container (${containerId})`);
  Util.Log(
    'materials:containers:entered',
    { id: containerId },
    `${Util.getName(plyId)} entered container (${containerId})`,
    plyId
  );
};

export const unregisterPlayerInContainer = (plyId: number) => {
  const cid = Util.getCID(plyId);
  const containerId = containerForPlayer.get(cid);
  containerForPlayer.delete(cid);

  containersLogger.silly(`CID ${cid} left container (${containerId})`);
  Util.Log(
    'materials:containers:left',
    { id: containerId },
    `${Util.getName(plyId)} left container (${containerId})`,
    plyId
  );
};

export const getContainerIdPlayerIsIn = (plyId: number) => {
  const cid = Util.getCID(plyId);
  return containerForPlayer.get(cid);
};

export const getContainerIdWhereKeyIs = (itemId: string | null) => {
  return Array.from(containers.keys()).find(containerId => {
    const container = getContainerById(containerId);
    if (!container) return false;
    if (container.public) return false;
    return container.keyItemId === itemId;
  });
};

export const linkContainerKeyItemId = (containerId: string, itemId: string) => {
  const container = getContainerById(containerId);
  if (!container || container.public) return;
  containers.set(containerId, { ...container, keyItemId: itemId });
  updateContainerKeyItemId(containerId, itemId);
};

// Gives mold to player for container without key
export const tryGivingKeyMold = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const isInGang = await Gangs.getPlayerGang(cid);
  if (!isInGang) {
    containersLogger.silly(`${cid} could not receive mold because he was not in a gang`);
    Util.Log(
      'materials:containers:noGangForMold',
      {},
      `${Util.getName(plyId)} could not receive mold because he was not in a gang`,
      plyId
    );
    return;
  }

  const containerId = getContainerIdWhereKeyIs(null);
  if (!containerId) return;
  const [moldItemId] = await Inventory.addItemToPlayer(plyId, 'key_mold', 1);
  setTimeout(() => {
    linkContainerKeyItemId(containerId, moldItemId);
  }, 1000);
};
