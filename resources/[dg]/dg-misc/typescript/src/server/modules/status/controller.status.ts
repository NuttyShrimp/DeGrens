import { Events, Chat, Status, BaseEvents } from '@dgx/server';
import { BLOCKED_GSR_WEAPONS } from './constants.status';
import { addStatusToPlayer, checkRemovalMethods, getPlayerStatuses, getStatusData } from './service.status';

global.exports('addStatusToPlayer', addStatusToPlayer);
global.exports('getPlayerStatuses', getPlayerStatuses);

// Handle gsr
Events.onNet('weapons:server:firstShot', (src: number, weaponHash: number) => {
  if (BLOCKED_GSR_WEAPONS.has(weaponHash)) return;
  if (getPlayerStatuses(src).find(s => s === 'gsr')) return;
  addStatusToPlayer(src, 'gsr');
});

BaseEvents.onEnterWater(plyId => {
  checkRemovalMethods(plyId, 'water');
});

on('hospital:revive', (plyId: number) => {
  checkRemovalMethods(plyId, 'revive');
});

global.exports('showStatusesToPlayer', (showTo: number, target: number, filter?: StatusName[]) => {
  const statuses = getPlayerStatuses(target);
  let filtered: Status.Name[];
  if (!filter) {
    filtered = statuses;
  } else {
    filtered = statuses.filter(s => filter.includes(s));
  }

  let message = '';
  for (const status of filtered) {
    const data = getStatusData(status);
    if (!data) continue;
    message += `<br>  <b>•</b> ${data.label}`;
  }

  Chat.sendMessage(showTo, {
    prefix: 'Statussen: ',
    message: message,
    type: 'normal',
  });
});
