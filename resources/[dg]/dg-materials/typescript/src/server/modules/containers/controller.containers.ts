import { Events, Inventory, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { containersLogger } from './logger.containers';
import {
  canEnterContainer,
  getContainerById,
  getContainerIdNearPlayer,
  getContainerIdPlayerIsIn,
  getContainerIdWhereKeyIs,
  linkContainerKeyItemId,
  registerPlayerInContainer,
  tryGivingKeyMold,
  unregisterPlayerInContainer,
} from './service.containers';

global.exports('tryGivingKeyMold', tryGivingKeyMold);

RPC.register('materials:containers:isValid', (src: number, position: Vec3) => {
  const containerId = getContainerIdNearPlayer(src, position);
  return containerId !== undefined;
});

RPC.register('materials:containers:canEnter', (src: number, position: Vec3) => {
  const containerId = getContainerIdNearPlayer(src, position);
  if (!containerId) return false;
  return canEnterContainer(src, containerId);
});

Events.onNet('materials:containers:entered', (src: number, position: Vec3) => {
  registerPlayerInContainer(src, position);
});

Events.onNet('materials:containers:left', (src: number) => {
  unregisterPlayerInContainer(src);
});

RPC.register('materials:containers:getBenchName', (src: number) => {
  const containerId = getContainerIdPlayerIsIn(src);
  if (!containerId) return;
  return getContainerById(containerId)?.bench;
});

Events.onNet('materials:containers:meltMold', async (src: number) => {
  const moldItem = await Inventory.getFirstItemOfNameOfPlayer(src, 'key_mold');
  if (!moldItem) {
    Notifications.add(src, 'Je onbreekt iets', 'error');
    return;
  }

  const required = getConfig().containers.requiredPlayers;
  if (Util.getAmountOfPlayers() < required) {
    Notifications.add(src, 'Is niet warm genoeg', 'error');
    return;
  }

  const containerId = getContainerIdWhereKeyIs(moldItem.id);
  if (!containerId) {
    Notifications.add(src, 'Vorm onbekend', 'error');
    containersLogger.error(`Player ${src} has key_mold (${moldItem.id}) which is not linked to any containers`);
    Util.Log(
      'materials:containers:noLinkedContainer',
      { moldItem },
      `${Util.getName(src)} has key_mold (${moldItem.id}) which is not linked to any containers`,
      src,
      true
    );
    // if this happens its a cheater or staff that spawned shit in for some fucking reason
    return;
  }

  const amount = getConfig().containers.mold.requiredSteel;
  const removedItems = await Inventory.removeItemAmountFromPlayer(src, 'refined_steel', amount);
  if (!removedItems) {
    Notifications.add(src, 'Je hebt niet genoeg om dit te vullen', 'error');
    return;
  }

  Inventory.destroyItem(moldItem.id);

  // we dont await taskbar to ensure player does not somehow cancel by crashing etc, this way even if player crashes, item shit will still go through
  const timeout = 15000;
  Taskbar.create(src, 'mold_melt_filling', 'fill', 'Vullen', timeout, {
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });

  setTimeout(async () => {
    const [keyItemId] = await Inventory.addItemToPlayer(src, 'container_key', 1);
    setTimeout(() => {
      linkContainerKeyItemId(containerId, keyItemId);
    }, 1000);

    containersLogger.silly(`Player ${src} has created key for container (${containerId})`);
    Util.Log(
      'materials:containers:noLinkedContainer',
      { containerId, moldItem, keyItemId },
      `${Util.getName(src)} has created key for container (${containerId})`,
      src
    );
  }, timeout);
});