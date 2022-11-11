import { Events, Inventory, Jobs, Notifications, RPC, Vehicles } from '@dgx/server';
import { changeJob, getGroupByServerId } from 'modules/groups/service';
import {
  assignLocationToGroup,
  getDonePartsForGroup,
  getLootFromVehicle,
  getScrapyardConfig,
  handleVehicleLockpick,
  playerLeftGroup,
  syncScrapyardJobToClient,
} from './service.scrapyard';

Events.onNet('jobs:scrapyard:signIn', async (src: number) => {
  const group = getGroupByServerId(src);
  if (!group) {
    Notifications.add(src, 'Je zit niet in een groep!', 'error');
    return;
  }

  const jobAssigned = changeJob(src, 'scrapyard');
  if (!jobAssigned) return;

  assignLocationToGroup(src);
});

Vehicles.onLockpick((plyId, vehicle, type) => {
  if (type !== 'door') return;
  handleVehicleLockpick(plyId, vehicle);
});

Jobs.onGroupJoin((plyId, cid, groupId) => {
  syncScrapyardJobToClient(groupId, plyId, cid);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  playerLeftGroup(groupId, plyId);
});

Events.onNet('jobs:scrapyard:getLoot', (src: number, netId: number, doorId: number) => {
  getLootFromVehicle(src, netId, doorId);
});

Events.onNet('jobs:scrapyard:givePart', async (src: number) => {
  let success = false;
  const config = getScrapyardConfig();
  for (const itemName of config.partItems) {
    success = await Inventory.removeItemFromPlayer(src, itemName);
    if (success) break;
  }
  if (!success) {
    Notifications.add(src, 'Je hebt niks om te geven', 'error');
    return;
  }

  const loot = config.loot[Math.floor(Math.random() * config.loot.length)];
  Inventory.addItemToPlayer(src, loot, 1);
});

RPC.register('jobs:scrapyard:getDoneParts', (src: number, netId) => {
  const group = getGroupByServerId(src);
  if (!group) return;
  return getDonePartsForGroup(group.id, netId);
});
