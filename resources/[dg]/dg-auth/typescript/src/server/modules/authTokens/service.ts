import { getPlySteamId } from '../../sv_util';
import jwt from 'jsonwebtoken';
import { PRIVATE_TOKEN } from '../../helpers/privateToken';
import { mainLogger } from '../../sv_logger';

// Player session tokens made with JWT
// Tokens are unique for each player and each resource

export const createResourceToken = (src: number, resource: string) => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Auth: Could not find steamId identifier. Is your steam running?');
    return;
  }
  const data = {
    steamId,
    timestamp: Date.now(),
    resource,
  };
  const token = jwt.sign(data, PRIVATE_TOKEN, {
    // Max span between server restarts
    expiresIn: '12h',
  });
  emitNet('dg-auth:token:set', src, resource, token);
};

export const validateToken = (src: number, resource: string, token: string) => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Auth: Could not find steamId identifier. Is your steam running?');
    return;
  }
  try {
    const data = jwt.verify(token, PRIVATE_TOKEN, {}) as ResourceTokenData;
    if (!data?.steamId || !data?.resource) {
      global.exports['dg-admin'].ACBan(src, 'Unauthorized event triggering (invalid session token)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a invalid token | token.steamId: ${
          data.steamId
        } | token.resource: ${data.resource}`
      );
      return false;
    }
    if (data.steamId !== steamId) {
      global.exports['dg-admin'].ACBan(src, 'Unauthorized event triggering (mismatching steam ids)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a token with mismatching steamIds | ${steamId} vs ${data.steamId}`
      );
      return false;
    }
    if (data.resource !== resource) {
      global.exports['dg-admin'].ACBan(src, 'Unauthorized event triggering (mismatching resources)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a token with mismatching resources | ${resource} vs ${
          data.resource
        }`
      );
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
