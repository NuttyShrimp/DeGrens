import { Inventory, Notifications, UI } from '@dgx/server';

declare interface GetItemDataData {
  itemId?: string;
}

export const getItemData: CommandData = {
  name: 'getItemData',
  role: 'staff',
  log: 'checked item data',
  isClientCommand: false,
  target: false,
  handler: async (caller, args: GetItemDataData) => {
    if (!args?.itemId || args.itemId === '') {
      Notifications.add(caller.source, 'No item selected', 'error');
      return;
    }

    const dbItemData = await Inventory.getItemStateFromDatabase(args.itemId);
    const cacheItemData = Inventory.getItemStateById(args.itemId);

    const copyData = { itemId: args.itemId, dbItemData, cacheItemData };

    UI.addToClipboard(caller.source, JSON.stringify(copyData));
    Notifications.add(caller.source, 'Data staat in je clipboard');
  },
  UI: {
    title: 'Get Item Data',
    info: {
      overrideFields: ['itemId'],
    },
  },
};
