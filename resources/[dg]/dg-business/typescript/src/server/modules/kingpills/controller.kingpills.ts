import { Events, Util, Jobs, RPC } from '@dgx/server';
import {
  handleKingPillsJobLeave,
  lootEnemy,
  restoreKingPillsJob,
  handleKingPillsPickupEnter,
  startKingPillsJob,
} from './service.kingpills';

Events.onNet('business:kingpills:startJob', startKingPillsJob);
Events.onNet('business:kingpills:loot', lootEnemy);
Events.onNet('business:kingpills:handlePickupEnter', handleKingPillsPickupEnter);

Util.onCharSpawn(plyId => {
  restoreKingPillsJob(plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  handleKingPillsJobLeave(plyId, groupId);
});
