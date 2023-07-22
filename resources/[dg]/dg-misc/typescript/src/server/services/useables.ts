// use for items that only have need a single handler function

import { Events, Inventory, Util, Chat, SyncedObjects } from '@dgx/server';

Inventory.registerUseable('parachute', plyId => {
  Events.emitNet('misc:parachute:toggle', plyId);
});

Inventory.registerUseable('scuba_gear', plyId => {
  Events.emitNet('misc:scubagear:toggle', plyId);
});

Inventory.registerUseable('id_card', (plyId, itemState) => {
  const plyInRadius = Util.getAllPlayersInRange(plyId, 5);
  const chatMessage: Chat.Message = {
    type: 'idcard',
    message: itemState.metadata as Chat.CardMessage['message'],
  };
  Chat.sendMessage(plyId, chatMessage);
  plyInRadius.forEach(ply => {
    Chat.sendMessage(ply, chatMessage);
  });
});

Inventory.registerUseable('binoculars', plyId => {
  Events.emitNet('misc:binoculars:use', plyId);
});

Inventory.registerUseable('lawnchair', plyId => {
  Events.emitNet('misc:lawnchair:use', plyId);
});

Inventory.registerUseable('lawntable', (plyId, itemState) => {
  const plyPed = GetPlayerPed(String(plyId));
  const plyCoords = Util.getEntityCoords(plyPed);
  const plyHeading = GetEntityHeading(plyPed);
  const offset = Util.getOffsetFromCoords({ ...plyCoords, w: plyHeading }, { x: 0, y: 1, z: -0.6 });
  SyncedObjects.add({
    model: 'prop_ven_market_table1',
    coords: offset,
    rotation: { x: 0, y: 0, z: plyHeading },
    flags: {
      isLawnTable: true,
    },
  });
  Inventory.destroyItem(itemState.id);
});

Events.onNet('misc:lawntable:pickup', (plyId, objId: string) => {
  SyncedObjects.remove(objId);
  Inventory.addItemToPlayer(plyId, 'lawntable', 1);
});
