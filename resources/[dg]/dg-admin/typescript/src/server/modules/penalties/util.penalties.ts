import { getPlayerForSteamId } from '../../helpers/identifiers';
import { mainLogger } from '../../sv_logger';

export const penaltyLogger = mainLogger.child({
  module: 'penalties',
});

export const dropBySteamId = (steamId: string, reason: string) => {
  // Search active player with steamID
  const ply = getPlayerForSteamId(steamId);
  if (ply) {
    // Kick player
    DropPlayer(String(ply.source), reason);
  }
};
