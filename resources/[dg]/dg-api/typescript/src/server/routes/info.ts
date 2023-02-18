import { SQL } from '@dgx/server';
import { getRoleListForPlayer, getRolesForPlayer } from 'helpers/roles';
import { registerRoute } from 'sv_routes';

registerRoute('GET', '/info', (req, res) => {
  const info = {
    activePlayers: GetNumPlayerIndices(),
    // TODO: Actually implement shit for queue
    queuedPlayers: 0,
    queue: [] as any[],
  };
  res(200, info);
});

// INFO: For this to be performant. We should move metadata and all the fast-changing data to seperate tables
registerRoute('GET', '/info/players', async (req, res) => {
  // FetcH ALL players
  const lastUpdated = req.params.lastUpdated ?? 0;
  const now = Date.now() / 1000;
  try {
    const updatedPlayers = await SQL.query<{ name: string; steamId: string; discordId: string }[]>(
      'SELECT name, steamid AS steamId, discord as discordId FROM users WHERE (last_updated BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)) AND created_at < FROM_UNIXTIME(?)',
      [lastUpdated, now, lastUpdated]
    );
    const newPlayers = await SQL.query<{ name: string; steamId: string; discordId: string }[]>(
      'SELECT name, steamid AS steamId, discord as discordId FROM users WHERE created_at BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)',
      [lastUpdated, now]
    );
    res(200, {
      players: await Promise.all(
        newPlayers
          .filter(p => !updatedPlayers.find(up => p.steamId === up.steamId))
          .concat(updatedPlayers)
          .map(async ply => {
            const roles = await getRolesForPlayer(ply.steamId);
            return { ...ply, roles: Object.keys(roles).filter(role => roles[role as keyof APIInfo.PlayerRoles]) };
          })
      ),
      lastUpdated: Math.round(now),
    });
  } catch (e) {
    console.error(e);
    res(500, {
      message: 'Failed to retrieve all players information',
    });
  }
});

registerRoute('GET', '/info/active', (_, res) => {
  const players = Object.values(DGCore.Functions.GetQBPlayers()) as Player[];
  res(
    200,
    players.map(p => ({ cid: p.PlayerData.citizenid, serverId: p.PlayerData.source }))
  );
});

registerRoute('GET', '/info/:steamId/active', async (req, res) => {
  const steamId = String(req.params.steamId);
  if (!steamId || !steamId.startsWith('steam:')) {
    res(400, {
      message: 'steamid is not found or valid',
    });
    return;
  }
  const player: { PlayerData: PlayerData } = await global.exports['dg-core'].GetPlayer(steamId);
  return res(200, {
    cid: player?.PlayerData?.citizenid ?? 0,
  });
});

registerRoute('GET', '/info/serverId/:id', async (req, res) => {
  const serverId = req.params.id;
  if (!serverId) {
    res(400, {
      message: 'No serverId given',
    });
    return;
  }
  if (Number.isNaN(parseInt(serverId))) {
    res(400, {
      message: 'Invalid serverId given',
    });
    return;
  }
  try {
    const plyState = Player(parseInt(serverId))?.state;
    if (!plyState) {
      res(404, {
        message: `No player found with id ${serverId}`,
      });
    }
    res(200, {
      steamId: plyState.steamId,
    });
  } catch (e) {
    res(500, {
      message: `Failed to retrieve steamId for ${serverId}`,
    });
  }
});

registerRoute('GET', '/info/player/roles/:steamId', async (req, res) => {
  const steamId = String(req.params.steamId);
  if (!steamId || !steamId.startsWith('steam:')) {
    res(200, []);
    return;
  }
  const roles = await getRoleListForPlayer(steamId);
  res(200, roles);
});

registerRoute('POST', '/vehicles/give', async (req, res) => {
  await global.exports['dg-vehicles'].giveNewVehicle(req.body.model, Number(req.body.owner));
  res(200, {
    result: true,
  });
});
