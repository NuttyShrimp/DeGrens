import { Admin, Jobs } from "@dgx/server";
import { registerRoute } from "sv_routes";
import {getRoleListForPlayer} from '../helpers/roles';

registerRoute('GET', '/token/:token', async (req, res) => {
  if (!req.params.token) {
    return res(400, {
      valid: false,
      message: "No token found to check",
    });
  }
  const cid: string | null = await global.exports['dg-auth'].getSteamIdFromPanelToken(req.params.token);

  if (!cid) {
    return res(404, {
      valid: false,
      message: 'Token did not include a valid SteamId',
    });
  }
  res(200, {
    valid: true,
  });
})

registerRoute('DELETE', '/tokens/:token', (req, res) => {
  if (!req.params.token) {
    return res(400, {
      message: "No token found to check",
    });
  }
  global.exports['dg-auth'].removePanelToken(req.params.token);
  res(200, {});
})

registerRoute('GET', '/tokens/info/:token', async (req, res) => {
  if (!req.params.token) {
    return res(400, {
      message: "No token found to check",
    });
  }
  const steamId: string | null = await global.exports['dg-auth'].getSteamIdFromPanelToken(req.params.token);
  if (!steamId) {
    res(404, {
      message: 'No valid steamId found in token'
    });
    return;
  }
  const player: {PlayerData: PlayerData} = await global.exports['dg-core'].GetPlayer(steamId);
  if (!player) {
    res(404, {
      message: 'No active player found bind to steamId'
    });
    return;
  }
  const tokenInfo = {
    steamId: steamId,
    discordId: player.PlayerData.discord,
    username: player.PlayerData.name, 
    roles: await getRoleListForPlayer(steamId)
  }
  res(200,tokenInfo);
})
