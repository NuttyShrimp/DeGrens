import { Events, Inventory, RPC } from '@dgx/server';
import {
  addFishToGroupVehicle,
  startJobForGroup,
  finishFishingJob,
  useFishingRod,
  trySpecialLoot,
} from './service.fishing';

Events.onNet('jobs:fishing:signIn', (src: number, jobType: Fishing.JobType) => {
  startJobForGroup(src, jobType);
});

Events.onNet('jobs:fishing:finish', (src: number, vehNetId: number) => {
  finishFishingJob(src, vehNetId);
});

Events.onNet('jobs:fishing:putAwayFish', (src: number, vehNetId: number) => {
  addFishToGroupVehicle(src, vehNetId);
});

Inventory.registerUseable('fishing_rod', plyId => {
  useFishingRod(plyId);
});

RPC.register('jobs:fishing:trySpecialLoot', (src: number) => {
  return trySpecialLoot(src);
});
