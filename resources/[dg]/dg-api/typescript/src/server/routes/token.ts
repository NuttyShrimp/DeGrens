import { getRoleListForPlayer } from '../helpers/roles';
import { FastifyPluginAsync } from 'fastify';

export const tokenRouter: FastifyPluginAsync = async server => {
  server.delete<{ Params: { token: string } }>('/:token', (req, res) => {
    if (!req.params.token) {
      return res.code(400).send({
        message: 'No token found to check',
      });
    }
    global.exports['dg-auth'].removePanelToken(req.params.token);
    return res.code(200).send({});
  });

  server.get<{ Params: { token: string } }>('/:token/info', async (req, res) => {
    if (!req.params.token) {
      return res.code(400).send({
        message: 'No token found to check',
      });
    }
    const steamId: string | null = global.exports['dg-auth'].getSteamIdFromPanelToken(req.params.token);
    if (!steamId) {
      return res.code(404).send({
        message: 'No valid steamId found in token',
      });
    }
    const serverId = await global.exports['dg-auth'].getServerIdForSteamId(steamId);
    if (!serverId) {
      return res.code(404).send({
        message: 'No active player found bind to steamId',
      });
    }
    const tokenInfo = {
      steamId: steamId,
      discordId: global.exports['dg-admin'].getIdentifierForPlayer(serverId, 'discord'),
      username: GetPlayerName(serverId),
      roles: await getRoleListForPlayer(steamId),
    };
    return res.code(200).send(tokenInfo);
  });
};
