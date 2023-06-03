import { Inventory, Notifications, UI } from '@dgx/server';

declare interface ChangeItemMetadataData {
  itemId?: string;
}

export const changeItemMetadata: CommandData = {
  name: 'changeItemMetadata',
  role: 'developer',
  log: 'changed an items metadata',
  isClientCommand: false,
  target: false,
  handler: async (caller, args: ChangeItemMetadataData) => {
    if (!args?.itemId || args.itemId === '') {
      Notifications.add(caller.source, 'No itemId provided', 'error');
      return;
    }

    const itemData = Inventory.getItemStateById(args.itemId);
    if (!itemData) {
      Notifications.add(caller.source, 'Item does not exist or is not loaded', 'error');
      return;
    }

    const result = await UI.openInput<{ metadata: string }>(caller.source, {
      header: 'Change Item Metadata',
      inputs: [
        {
          type: 'text',
          name: 'metadata',
          label: 'Metadata',
          value: JSON.stringify(itemData.metadata),
        },
      ],
    });
    if (!result.accepted) return;

    try {
      const newMetadata = JSON.parse(result.values.metadata);
      Inventory.setMetadataOfItem(args.itemId, () => newMetadata);
      Notifications.add(caller.source, 'Successfully changed item metadata', 'success');
    } catch (e) {
      Notifications.add(caller.source, 'Invalid JSON', 'error');
    }
  },
  UI: {
    title: 'Change Item Metadata',
    info: {
      overrideFields: ['itemId'],
    },
  },
};
