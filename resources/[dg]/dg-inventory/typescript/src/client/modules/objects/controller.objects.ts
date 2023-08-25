import { Core, Events } from '@dgx/client';
import objectsManager from './classes/objectsmanager';

Events.onNet('inventory:client:updateObject', (action: 'add' | 'remove', item: Objects.Item) => {
  if (action === 'add') {
    objectsManager.addedItem(item);
  } else {
    objectsManager.removedItem(item);
  }
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  objectsManager.reset(true);
});

Core.onPlayerUnloaded(() => {
  objectsManager.reset();
});

Events.onNet('propattach:reset', () => {
  objectsManager.reset();
});

Events.onNet('inventory:objects:toggle', (itemId: string, toggle: boolean) => {
  objectsManager.toggleObject(itemId, toggle);
});

Events.onNet('inventory:objects:toggleAll', (toggle: boolean) => {
  objectsManager.toggleAllObjects(toggle);
});

Events.onNet('inventory:objects:setConfig', (config: Objects.Config) => {
  objectsManager.setConfig(config);
});
