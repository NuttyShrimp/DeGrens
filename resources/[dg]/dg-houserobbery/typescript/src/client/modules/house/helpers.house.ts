import { Events, Notifications, PolyZone, RPC } from '@dgx/client';
import { enterInterior, leaveInterior } from 'services/interiors';
import { setSelectedHouse } from './controller.house';

export const enterHouse = async (houseId: string) => {
  const canEnter = await RPC.execute<boolean>('houserobbery:server:canEnter', houseId);
  if (!canEnter) {
    Notifications.add('Deze deur is nog vast...', 'error');
    return;
  }

  setSelectedHouse(houseId);
  enterInterior();
};

export const leaveHouse = () => {
  leaveInterior();
  PolyZone.removeZone('houserobbery_exit');
};

export const searchLootLocation = async (houseId: string, zoneName: string, lootTableId = 0) => {
  if (!houseId || !zoneName) return;
  Events.emitNet('houserobbery:server:doLootZone', houseId, zoneName, lootTableId);
};
