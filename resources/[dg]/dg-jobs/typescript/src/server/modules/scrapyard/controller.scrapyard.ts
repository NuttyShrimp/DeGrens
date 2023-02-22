import { Events, Inventory, Notifications, RPC, Vehicles, Util } from '@dgx/server';
import { getGroupByServerId } from 'modules/groups/service';
import {
  assignLocationToGroup,
  getDonePartsForGroup,
  getLootFromVehicle,
  getScrapyardConfig,
  handleVehicleLockpick,
} from './service.scrapyard';

Events.onNet('jobs:scrapyard:signIn', async (src: number) => {
  assignLocationToGroup(src);
});

Vehicles.onLockpick((plyId, vehicle, type) => {
  if (type !== 'door') return;
  handleVehicleLockpick(plyId, vehicle);
});

Events.onNet('jobs:scrapyard:getLoot', (src: number, netId: number, doorId: number) => {
  getLootFromVehicle(src, netId, doorId);
});

Events.onNet('jobs:scrapyard:givePart', async (src: number) => {
  let success = false;
  const config = getScrapyardConfig();
  for (const itemName of config.partItems) {
    success = await Inventory.removeItemByNameFromPlayer(src, itemName);
    if (success) break;
  }
  if (!success) {
    Notifications.add(src, 'Je hebt niks om te geven', 'error');
    return;
  }

  const loot = config.loot[Math.floor(Math.random() * config.loot.length)];
  const [min, max] = config.lootAmount;
  const amount = Util.getRndInteger(min, max + 1);
  Inventory.addItemToPlayer(src, loot, amount);
});

RPC.register('jobs:scrapyard:getDoneParts', (src: number, netId: number) => {
  const group = getGroupByServerId(src);
  if (!group) return;
  return getDonePartsForGroup(group.id, netId);
});
