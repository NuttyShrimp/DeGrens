// use for items that only have need a single handler function

import { Events, Inventory, Util, Chat } from '@dgx/server';

Inventory.registerUseable('parachute', plyId => {
  Events.emitNet('misc:parachute:toggle', plyId);
});

Inventory.registerUseable('scuba_gear', plyId => {
  Events.emitNet('misc:scubagear:toggle', plyId);
});

Inventory.registerUseable('id_card', (plyId, itemState: Inventory.ItemState<Chat.CardMessage['message']>) => {
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
