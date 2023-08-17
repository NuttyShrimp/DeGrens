import { Events, Inventory, SyncedObjects } from '@dgx/server';
import { propertyManager } from 'classes/propertyManager';

Inventory.registerUseable('mailbox', plyId => {
  Events.emitNet('realestate:placeMailbox', plyId);
});

Inventory.onInventoryUpdate('stash', (id, action) => {
  if (!id.startsWith('mailbox_recv_') || action !== 'add') return;

  const houseName = id.replace('mailbox_recv_', '');
  if (!houseName) return;

  Inventory.moveAllItemsToInventory('stash', id, 'stash', `mailbox_${houseName}`);
});

SyncedObjects.onRemove(ids => {
  ids.forEach(id => {
    if (!propertyManager.mailboxIds.includes(id)) return;
    const property = propertyManager.getHouseForMailboxId(id);
    if (!property) return;
    propertyManager.setPropertyMailbox(property.name, id, 'remove');
  });
});
