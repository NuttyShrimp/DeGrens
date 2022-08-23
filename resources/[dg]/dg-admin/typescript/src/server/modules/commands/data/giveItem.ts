import { Inventory, Notifications } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

declare interface GiveItemData {
  Target?: UI.Player;
  Item?: UI.Item;
  amount?: string;
}

// TODO: add ability to add item to non-player inventory
// For above, we need to add some extra exports to inv to check if inv exists
// and add that we also can give items to non-player invs
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
      Inventory.addItemToPlayer(args?.Target?.serverId ?? caller.source, args?.Item?.name ?? '', amount);
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
