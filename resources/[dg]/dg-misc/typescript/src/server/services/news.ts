import { Events, Inventory, Notifications, SyncedObjects, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const playersWithNewsItems = new Map<number, Inventory.ItemState>();

const NEWS_ITEMS = ['news_microphone', 'news_boommic', 'news_camera'];

Inventory.registerUseable(NEWS_ITEMS, (plyId, itemState) => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  const activeNewsItem = playersWithNewsItems.get(plyId);

  if (!activeNewsItem) {
    playersWithNewsItems.set(plyId, itemState);
    Events.emitNet('misc:news:toggleItem', plyId, itemState.name);
    return;
  }

  if (activeNewsItem.name === itemState.name) {
    playersWithNewsItems.delete(plyId);
    Events.emitNet('misc:news:toggleItem', plyId);
    return;
  }

  Notifications.add(plyId, 'Je hebt nog een ander nieuwsitem vast', 'error');
});

Inventory.onInventoryUpdate(
  'player',
  (cid, _, itemState) => {
    if (NEWS_ITEMS.indexOf(itemState.name) === -1) return;

    const plyId = charModule.getServerIdFromCitizenId(+cid);
    if (!plyId) return;

    const activeNewsItem = playersWithNewsItems.get(plyId);
    if (activeNewsItem?.id !== itemState.id) return;

    playersWithNewsItems.delete(plyId);
    Events.emitNet('misc:news:toggleItem', plyId);
  },
  undefined,
  'remove'
);

Inventory.registerUseable('news_light', (plyId, itemState) => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  if (playersWithNewsItems.has(plyId)) {
    Notifications.add(plyId, 'Je hebt nog een nieuwsitem vast', 'error');
    return;
  }

  const plyPed = GetPlayerPed(String(plyId));
  const pedHeading = GetEntityHeading(plyPed);
  const lightCoords = Util.getOffsetFromEntity(plyPed, { x: 0, y: 1, z: -1 });

  Inventory.destroyItem(itemState.id);
  Events.emitNet('misc:news:lightPlaceAnim', plyId);
  SyncedObjects.add(
    {
      model: 'prop_studio_light_02',
      coords: lightCoords,
      rotation: { x: 0, y: 0, z: pedHeading + 180 },
      flags: {
        isNewsLight: true,
      },
    },
    plyId
  );
});

Events.onNet('misc:news:takeLight', (plyId: number, syncedObjectId: string) => {
  SyncedObjects.remove(syncedObjectId);
  Inventory.addItemToPlayer(plyId, 'news_light', 1);
});
