import { Events } from '@dgx/client';
import objectsManager from './classes/objectsmanager';

Events.onNet('inventory:client:updateObject', (action: 'add' | 'remove', itemId: string, objectInfo: Objects.Info) => {
  if (action === 'add') {
    objectsManager.addedItem(itemId, objectInfo);
  } else {
    objectsManager.removedItem(itemId);
  }
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  objectsManager.removeAll();
});
