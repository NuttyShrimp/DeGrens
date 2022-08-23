import { SQL } from '@dgx/server';

import { doesPlayerHaveWhitelistedRole } from '../../helpers/discord';
import { getIdentifierForPlayer } from '../../helpers/identifiers';
import { mainLogger } from '../../sv_logger';

const whitelistedPlayer: Set<string> = new Set();

export const loadWhitelist = async (): Promise<void> => {
  const result = await SQL.query(`SELECT *
                                  FROM whitelist`);
  result.forEach((row: any) => {
    whitelistedPlayer.add(row.steam_id);
  });
};

export const isPlayerWhitelisted = async (player: number): Promise<boolean> => {
  // Player should have a certain discord role or should be in the whitelist set
  const steamId = getIdentifierForPlayer(player, 'steam');
  if (!steamId) {
    mainLogger.debug(
      `Failed to get steam id for player ${GetPlayerName(
        String(player)
      )}(${player}) while checking if they are whitelisted`
    );
    return false;
  }
  const discordWhitelisted = await doesPlayerHaveWhitelistedRole(player);
  const isWhitelisted = whitelistedPlayer.has(steamId) || discordWhitelisted;
  mainLogger.debug(
    `${GetPlayerName(String(player))}(${player}|${steamId}) is ${isWhitelisted ? '' : 'not '}whitelisted`
  );
  return isWhitelisted;
};
