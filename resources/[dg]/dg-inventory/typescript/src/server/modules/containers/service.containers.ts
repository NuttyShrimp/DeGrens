import { Inventory, UI } from '@dgx/server';
import itemManager from 'modules/items/manager.items';
import { getConfig } from 'services/config';

let containers: { [key: string]: { allowedItems: string[]; size: number } };

export const getContainerInfo = (name: string) => containers[name];

export const isItemAContainer = (name: string) => !!containers[name];

export const registerContainers = () => {
  containers = getConfig().containers;

  Inventory.registerUseable<{ label: string; isContainer: boolean }>(Object.keys(containers), (plyId, state) => {
    const item = itemManager.get(state.id);
    if (!item) return;

    // make sure every container item has the isContainer metadata entry.
    // This is used in UI to handle crafting requirement checks when trying to use items inside containers
    item.setMetadata(old => ({ ...old, isContainer: true, hiddenKeys: ['isContainer', ...(old.hiddenKeys ?? [])] }));

    UI.openContextMenu(plyId, [
      {
        title: 'Openen',
        icon: 'box-open',
        callbackURL: 'inventory/containers/open',
        data: {
          containerId: state.id,
        },
      },
      {
        title: 'Label Veranderen',
        icon: 'tag',
        callbackURL: 'inventory/containers/label',
        data: {
          containerId: state.id,
          label: state.metadata?.label ?? '',
        },
      },
    ]);
  });
};
