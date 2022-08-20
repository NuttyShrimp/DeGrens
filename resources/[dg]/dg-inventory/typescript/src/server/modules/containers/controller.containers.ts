import { Events, Inventory, Util } from '@dgx/server';
import { getConfig } from 'services/config';

let containers: { [key: string]: { allowedItems: string[]; size: number } };

export const getContainerInfo = (name: string) => containers[name];

export const registerContainers = async () => {
  await Util.awaitCondition(() => getConfig() !== null);
  containers = getConfig().containers;

  Inventory.registerUseable(Object.keys(containers), (src, state) => {
    Events.emitNet('inventory:client:openContainer', src, state.id);
  });
};
