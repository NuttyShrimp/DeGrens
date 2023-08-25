import { Events, Inventory, Notifications, SyncedObjects, Util } from '@dgx/server';

const PLACEABLE_OBJECT_ITEMS: Record<string, { model: string; offset: Vec3 }> = {
  lawntable: {
    model: 'prop_ven_market_table1',
    offset: { x: 0, y: 1, z: -0.6 },
  },
  medbag: {
    model: 'xm_prop_x17_bag_med_01a',
    offset: { x: 0, y: 1, z: -1 },
  },
};

const PLACEABLE_OBJECT_ITEM_BACKUP_STASH = 'placeableobject_itembackup';

setImmediate(async () => {
  await Inventory.awaitLoad();
  Inventory.clearInventory('stash', PLACEABLE_OBJECT_ITEM_BACKUP_STASH);
});

Inventory.registerUseable(Object.keys(PLACEABLE_OBJECT_ITEMS), (plyId, itemState) => {
  const objectItemData = PLACEABLE_OBJECT_ITEMS[itemState.name];
  if (!objectItemData) return;

  const plyPed = GetPlayerPed(String(plyId));
  const plyCoords = Util.getEntityCoords(plyPed);
  const plyHeading = GetEntityHeading(plyPed);
  const offset = Util.getOffsetFromCoords({ ...plyCoords, w: plyHeading }, objectItemData.offset);

  SyncedObjects.add({
    model: objectItemData.model,
    coords: offset,
    rotation: { x: 0, y: 0, z: plyHeading },
    flags: {
      placeableObjectItemId: itemState.id,
    },
    skipStore: true,
  });
  Inventory.moveItemToInventory('stash', PLACEABLE_OBJECT_ITEM_BACKUP_STASH, itemState.id);
});

Events.onNet('misc:placeableObjectItems:pickup', async (plyId, objId: string, itemId: string) => {
  SyncedObjects.remove(objId);

  const itemState = Inventory.getItemStateById(itemId);
  if (!itemState || itemState.inventory !== Inventory.concatId('stash', PLACEABLE_OBJECT_ITEM_BACKUP_STASH)) {
    Notifications.add(plyId, 'Dit item bestaat niet meer', 'error');
    return;
  }

  Inventory.moveItemToPlayer(plyId, itemState.id);
  Inventory.showItemBox(plyId, itemState.name, 'Opgepakt');
});
