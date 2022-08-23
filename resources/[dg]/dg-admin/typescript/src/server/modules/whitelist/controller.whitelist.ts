import { Chat, Util } from '@dgx/server';

import { mainLogger } from '../../sv_logger';

import { isPlayerWhitelisted, loadWhitelist } from './service.whitelist';

setImmediate(() => {
  loadWhitelist();
});

global.exports('isPlayerWhitelisted', (player: number): Promise<boolean> => isPlayerWhitelisted(player));

Chat.registerCommand('admin_whitelist_refresh', 'Reload the cached whitelist', [], 'developer', source => {
  if (source > 0) {
    const msg = `${GetPlayerName(String(source))}(${source}) refreshed the cached whitelist`;
    mainLogger.info(msg);
    Util.Log(
      'admin:whitelist:refresh',
      {
        source: 'player',
      },
      msg,
      source,
      true
    );
  } else {
    mainLogger.info('Cached whitelist was refreshed via terminal');
    Util.Log(
      'admin:whitelist:refresh',
      {
        source: 'terminal',
      },
      'Cached whitelist was refreshed via terminal',
      undefined,
      true
    );
  }
  loadWhitelist();
});
