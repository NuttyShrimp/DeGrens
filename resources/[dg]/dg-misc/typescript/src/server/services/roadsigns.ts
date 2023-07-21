import { Events, Inventory, Notifications, PropRemover, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const holdingPlayers = new Map<number, string>(); // plyid to itemid

Events.onNet('misc:roadsigns:take', (plyId, entityModel: number, entityCoords: Vec3) => {
  const plyCoords = Util.getPlyCoords(plyId);
  if (plyCoords.distance(entityCoords) > 10) return;

  PropRemover.remove(entityModel, entityCoords);
  Inventory.addItemToPlayer(plyId, 'road_sign', 1, { model: entityModel, hiddenKeys: ['model'] });
});

Inventory.registerUseable('road_sign', (plyId, itemState) => {
  const holdingItemId = holdingPlayers.get(plyId);
  const itemModel = itemState.metadata?.model;
  if (!itemModel) {
    Notifications.add(plyId, 'Geen model gelinked aan dit bord', 'error');
    return;
  }

  if (!holdingItemId) {
    Events.emitNet('misc:roadsigns:toggle', plyId, itemModel);
    holdingPlayers.set(plyId, itemState.id);
    return;
  }

  if (holdingItemId !== itemState.id) {
    Notifications.add(plyId, 'Je hebt al een ander bord vast', 'error');
    return;
  }

  holdingPlayers.delete(plyId);
  Events.emitNet('misc:roadsigns:toggle', plyId);
});

Inventory.onInventoryUpdate(
  'player',
  (cid, _, itemState) => {
    const plyId = charModule.getServerIdFromCitizenId(+cid);
    if (!plyId) return;

    const holdingItemId = holdingPlayers.get(plyId);
    if (holdingItemId !== itemState.id) return;

    holdingPlayers.delete(plyId);
    Events.emitNet('misc:roadsigns:toggle', plyId);
  },
  'road_sign',
  'remove'
);
