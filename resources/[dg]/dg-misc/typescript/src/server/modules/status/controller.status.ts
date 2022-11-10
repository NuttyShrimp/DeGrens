import { Events } from '@dgx/server';
import { addStatusToPlayer, checkRemovalMethods } from './service.status';

global.exports('addStatusToPlayer', addStatusToPlayer);

Events.onNet('misc:status:enteredWater', (plyId: number) => {
  checkRemovalMethods(plyId, 'water');
});

// TODO: Add revive removalmethod when ambulance resource is finished
