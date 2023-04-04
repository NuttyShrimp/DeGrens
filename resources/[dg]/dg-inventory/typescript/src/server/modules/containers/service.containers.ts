import { Inventory, UI } from '@dgx/server';
import { getConfig } from 'services/config';

let containers: { [key: string]: { allowedItems: string[]; size: number } };

export const getContainerInfo = (name: string) => containers[name];

export const registerContainers = () => {
  containers = getConfig().containers;

  Inventory.registerUseable(Object.keys(containers), (plyId, state) => {
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
        },
      },
    ]);
  });
};
