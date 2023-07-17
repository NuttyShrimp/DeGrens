import { userModule } from 'helpers/core';
import { mainLogger } from '../../sv_logger';
import { Util } from '@dgx/server';

export const penaltyLogger = mainLogger.child({
  module: 'penalties',
});

export const dropBySteamId = (steamId: string, reason: string) => {
  // Search active player with steamID
  const serverId = userModule.getServerIdFromIdentifier('steam', steamId);
  if (serverId) {
    // Kick player
    DropPlayer(String(serverId), reason);
    penaltyLogger.info(
      `Dropped player ${Util.getName(serverId)}(${serverId}) | SteamID: ${steamId} | Reason: ${reason}`
    );
  }
};
