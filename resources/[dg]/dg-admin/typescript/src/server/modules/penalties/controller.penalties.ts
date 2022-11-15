import { Events, RPC } from '@dgx/server';

import { getIdentifierForPlayer } from '../../helpers/identifiers';

import penaltyInfoManager from './classes/penaltyInfoManager';
import { ACBan, banPlayer, isPlayerBanned, kickPlayer, warnPlayer } from './service.penalties';

global.asyncExports('isPlayerBanned', isPlayerBanned);
global.asyncExports('ban', banPlayer);
global.asyncExports('kick', kickPlayer);
global.asyncExports('warn', warnPlayer);
global.asyncExports('ACBan', ACBan);

on('dg-config:moduleLoaded', (module: string, data: Penalty.Config) => {
  if (module !== 'admin.bans') return;
  penaltyInfoManager.setInfo(data.classes, data.reasons);
});

Events.onNet('admin:penalties:penalisePlayer', (src, data: Penalty.IncomingData) => {
  switch (data.type) {
    case 'ban':
      banPlayer(src, data.target, data.reasons, data.points, data.length);
      break;
    case 'kick':
      kickPlayer(src, data.target, data.reasons, data.points);
      break;
    case 'warn':
      warnPlayer(src, data.target, data.reasons);
      break;
    default:
      banPlayer(
        src,
        getIdentifierForPlayer(src, 'steam'),
        ['Event Triggering with invalid data(penalisePlayer)'],
        30,
        -1
      );
      break;
  }
});

RPC.register('admin:penalties:getUIInfo', () => {
  return penaltyInfoManager.getInfo();
});
