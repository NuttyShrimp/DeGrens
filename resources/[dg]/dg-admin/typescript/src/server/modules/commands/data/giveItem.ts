import { Inventory, Notifications, Util } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

declare interface GiveItemData {
  Target?: UI.Player;
  Item?: UI.Item;
  amount?: string;
}

// TODO: add ability to add item to non-player inventory
export const giveItem: CommandData = {
  name: 'giveItem',
  role: 'staff',
  log: 'has given an item to a player',
  isClientCommand: false,
  target: false,
  handler: async (caller, args: GiveItemData) => {
    if (!args?.Item) {
      Notifications.add(caller.source, 'No item selected', 'error');
      return;
    }
    try {
      const amount = parseInt(args.amount ?? '1');
      const cid = String(Util.getCID(args?.Target?.serverId ?? caller.source));
      const item = args?.Item?.name ?? '';
      Inventory.addItemToInventory('player', cid, item, amount);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Failed to give item, Is your amount a round number?', 'error');
    }
  },
  UI: {
    title: 'Give Item',
    info: {
      inputs: [Inputs.Player, Inputs.Item],
      overrideFields: ['amount'],
    },
  },
};
