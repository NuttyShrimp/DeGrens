import { registerRoute } from 'sv_routes';
import { getRoleListForPlayer } from '../helpers/roles';

registerRoute('DELETE', '/tokens/:token', (req, res) => {
  if (!req.params.token) {
    return res(400, {
      message: 'No token found to check',
    });
  }
  global.exports['dg-auth'].removePanelToken(req.params.token);
  res(200, {});
});

registerRoute('GET', '/tokens/info/:token', async (req, res) => {
  if (!req.params.token) {
    return res(400, {
      message: 'No token found to check',
    });
  }
  const steamId: string | null = await global.exports['dg-auth'].getSteamIdFromPanelToken(req.params.token);
  if (!steamId) {
    res(404, {
      message: 'No valid steamId found in token',
    });
    return;
  }
  const player: { PlayerData: PlayerData } = await global.exports['dg-core'].GetPlayer(steamId);
  if (!player) {
    res(404, {
      message: 'No active player found bind to steamId',
    });
    return;
  }
  const tokenInfo = {
    steamId: steamId,
    discordId: player.PlayerData.discord,
    username: player.PlayerData.name,
    roles: await getRoleListForPlayer(steamId),
  };
  res(200, tokenInfo);
});
