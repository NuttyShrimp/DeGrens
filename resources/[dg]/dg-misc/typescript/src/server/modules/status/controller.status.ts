import { Events } from '@dgx/server';
import { BLOCKED_GSR_WEAPONS } from './constants.status';
import { addStatusToPlayer, checkRemovalMethods, getPlayerStatuses } from './service.status';

global.exports('addStatusToPlayer', addStatusToPlayer);
global.exports('getPlayerStatuses', getPlayerStatuses);

Events.onNet('weapons:server:firstShot', (src: number, weaponHash: number) => {
  if (BLOCKED_GSR_WEAPONS.has(weaponHash)) return;
  if (getPlayerStatuses(src).find(s => s === 'gsr')) return;
  addStatusToPlayer(src, 'gsr');
});

Events.onNet('misc:status:enteredWater', (plyId: number) => {
  checkRemovalMethods(plyId, 'water');
});

// TODO: Add revive removalmethod when ambulance resource is finished
