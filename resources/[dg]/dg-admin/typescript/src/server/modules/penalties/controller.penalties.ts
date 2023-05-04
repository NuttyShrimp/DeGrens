import { Config, Core, Events, RPC, SQL, UI } from '@dgx/server';

import { getIdentifierForPlayer } from '../../helpers/identifiers';

import penaltyInfoManager from './classes/penaltyInfoManager';
import { ACBan, banPlayer, clearKickPenalties, isPlayerBanned, kickPlayer, warnPlayer } from './service.penalties';

global.asyncExports('isPlayerBanned', isPlayerBanned);
global.asyncExports('ban', banPlayer);
global.asyncExports('kick', kickPlayer);
global.asyncExports('warn', warnPlayer);
global.asyncExports('ACBan', ACBan);

setImmediate(async () => {
  await Config.awaitConfigLoad();
  clearKickPenalties();
});

on('dg-config:moduleLoaded', (module: string, data: Penalty.Config) => {
  if (module !== 'admin.bans') return;
  penaltyInfoManager.setInfo(data.classes, data.reasons);
});

Core.onPlayerLoaded(async data => {
  const warns = await SQL.query<{ penaltyId: number; reason: string; points: number }[]>(
    'SELECT * FROM admin_unannounced_warns as aaw LEFT JOIN penalties p ON p.id = aaw.penaltyid WHERE aaw.steamid = ?',
    [data.steamId]
  );
  if (warns.length < 1) return;
  const missedWarns = warns.reduce((cur, w) => `${cur}${w.reason}(${w.points}) | `, '').replace(/ | $/, '');
  if (!data.serverId) return;
  UI.openInput(data.serverId, {
    header: 'Gemiste warns',
    inputs: [
      {
        label: 'Volgende warns heb je ontvangen toen je offline was:',
        name: 'subheader',
        type: 'display',
      },
      {
        label: missedWarns,
        name: 'warns',
        type: 'display',
      },
    ],
  });
  await SQL.query('DELETE FROM admin_unannounced_warns WHERE steamid = ?', [data.steamId]);
});

Events.onNet('admin:penalties:penalisePlayer', (src, data: Penalty.IncomingData) => {
  switch (data.type) {
    case 'ban':
      // length is always defined when type is ban
      banPlayer(src, data.target, data.reasons, data.points, data.length!);
      break;
    case 'kick':
      kickPlayer(src, data.target, data.reasons, data.points);
      break;
    case 'warn':
      warnPlayer(src, data.target, data.reasons, data.points);
      break;
    default:
      banPlayer(
        src,
        getIdentifierForPlayer(src, 'steam')!,
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
