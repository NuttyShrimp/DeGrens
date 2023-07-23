import { Events, Inventory, SyncedObjects, Util } from '@dgx/server';

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
      placeableObjectItem: itemState.name,
    },
  });
  Inventory.destroyItem(itemState.id);
});

Events.onNet('misc:placeableObjectItems:pickup', (plyId, objId: string, itemName: string) => {
  SyncedObjects.remove(objId);

  if (!!PLACEABLE_OBJECT_ITEMS[itemName]) {
    Inventory.addItemToPlayer(plyId, itemName, 1);
  }
});
