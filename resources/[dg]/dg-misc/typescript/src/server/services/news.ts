import { Events, Inventory, Notifications, SyncedObjects, Util } from '@dgx/server';

const playersWithNewsItems = new Map<number, string>();

['news_microphone', 'news_boommic', 'news_camera'].forEach(itemName => {
  Inventory.registerUseable(itemName, plyId => {
    if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
      Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig', 'error');
      return;
    }

    const activeNewsItem = playersWithNewsItems.get(plyId);

    if (!activeNewsItem) {
      playersWithNewsItems.set(plyId, itemName);
      Events.emitNet('misc:news:toggleItem', plyId, itemName);
      return;
    }

    if (activeNewsItem === itemName) {
      playersWithNewsItems.delete(plyId);
      Events.emitNet('misc:news:toggleItem', plyId);
      return;
    }

    Notifications.add(plyId, 'Je hebt nog een ander nieuwsitem vast', 'error');
  });
});

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
