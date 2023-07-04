import { Inventory, Notifications } from '@dgx/server';

type UnloadInventoryData = {
  inventoryId?: string;
};

export const unloadInventory: CommandData = {
  name: 'unloadInventory',
  role: 'developer',
  log: 'has unloaded an inventory',
  isClientCommand: false,
  target: false,
  handler: async (caller, args: UnloadInventoryData) => {
    if (!args?.inventoryId || args.inventoryId === '') {
      Notifications.add(caller.source, 'No inventory ID provided', 'error');
      return;
    }

    const invData = Inventory.splitId(args.inventoryId);
    if (!invData.type || !invData.identifier) {
      Notifications.add(caller.source, 'Meegegeven id is geen inventory id');
      return;
    }

    Inventory.forceUnloadInventory(args.inventoryId);
    Notifications.add(caller.source, 'Inventory has been unloaded');
  },
  UI: {
    title: 'Unload Inventory',
    info: {
      overrideFields: ['inventoryId'],
    },
  },
};
