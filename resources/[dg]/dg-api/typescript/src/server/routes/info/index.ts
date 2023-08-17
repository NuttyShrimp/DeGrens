import { FastifyPluginAsync } from 'fastify';
import { characterRouter } from './character';
import { Core } from '@dgx/server';
import { getRoleListForPlayer } from 'helpers/roles';

export const infoRouter: FastifyPluginAsync = async server => {
  server.register(characterRouter, { prefix: '/characters' });

  server.get('/', (_, res) => {
    const queueModule = Core.getModule('queue');
    const queueInfo = queueModule.getQueue();
    const info = {
      activePlayers: GetNumPlayerIndices(),
      queuedPlayers: queueInfo.length,
      queue: queueInfo,
    };
    return res.code(200).send(info);
  });

  server.get('/active', (_, res) => {
    const characterModule = Core.getModule('characters');
    const players = Object.values(characterModule.getAllPlayers());
    return res.code(200).send(players.map(p => ({ cid: p.citizenid, serverId: p.serverId })));
  });

  server.get<{ Params: { steamId: string } }>('/:steamId/active', async (req, res) => {
    const charModule = Core.getModule('characters');
    const steamId = String(req.params.steamId);
    if (!steamId || !steamId.startsWith('steam:')) {
      return res.code(400).send({
        message: 'steamid is not found or valid',
      });
    }
    const player = charModule.getPlayerBySteamId(steamId);
    return res.code(200).send({
      cid: player?.citizenid ?? 0,
    });
  });

  server.get<{ Params: { id: string } }>('/serverId/:id', async (req, res) => {
    const serverId = req.params.id;
    if (!serverId) {
      return res.code(400).send({
        message: 'No serverId given',
      });
    }
    if (Number.isNaN(parseInt(serverId))) {
      return res.code(400).send({
        message: 'Invalid serverId given',
      });
    }
    try {
      const plyState = Player(parseInt(serverId))?.state;
      if (!plyState) {
        res.code(404).send({
          message: `No player found with id ${serverId}`,
        });
      }
      return res.code(200).send({
        steamId: plyState.steamId,
      });
    } catch (e) {
      return res.code(500).send({
        message: `Failed to retrieve steamId for ${serverId}`,
      });
    }
  });

  server.get<{ Params: { steamId: string } }>('/player/roles/:steamId', async (req, res) => {
    const steamId = String(req.params.steamId);
    if (!steamId || !steamId.startsWith('steam:')) {
      return res.code(200).send([]);
    }
    const roles = await getRoleListForPlayer(steamId);
    res.code(200).send(roles);
  });
};
