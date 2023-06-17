import { Events, Util, Jobs, RPC } from '@dgx/server';
import {
  handleKingPillsJobLeave,
  lootEnemy,
  registerPedSpawned,
  restoreKingPillsJob,
  shouldKingPillsPedSpawn,
  startKingPillsJob,
} from './service.kingpills';

Events.onNet('business:kingpills:startJob', startKingPillsJob);
Events.onNet('business:kingpills:loot', lootEnemy);
Events.onNet('business:kingpills:pedSpawned', registerPedSpawned);
RPC.register('business:kingpills:shouldSpawn', shouldKingPillsPedSpawn);

Util.onCharSpawn(plyId => {
  restoreKingPillsJob(plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  handleKingPillsJobLeave(plyId, groupId);
});
