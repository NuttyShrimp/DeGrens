import { getPrivateToken } from '../../helpers/privateToken';
import { mainLogger } from '../../sv_logger';
import { getPlySteamId } from '../../sv_util';
import { createSigner, createVerifier } from 'fast-jwt';
import { isResourceKnown } from 'helpers/resources';
import { Admin } from '@dgx/server';

// Player session tokens made with JWT
// Tokens are unique for each player and each resource

let signer: any;
let verifier: any;

export const createJWSHandlers = () => {
  signer = createSigner({
    expiresIn: 1000 * 60 * 60 * 12,
    key: getPrivateToken(),
  });

  verifier = createVerifier({
    key: getPrivateToken(),
  });
}

export const createResourceToken = (src: number, resource: string) => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Auth: Could not find steamId identifier. Is your steam running?');
    return;
  }
  if (!isResourceKnown(resource)) {
    Admin.ACBan(src, "Auth: trying to retrieve event key for unknown resource", {
      resource
    })
  }
  const data = {
    steamId,
    timestamp: Date.now(),
    resource,
  };
  const token = signer(data);
  emitNet('dg-auth:token:set', src, resource, token);
  setTimeout(() => {
    emit('dg-auth:token:resourceRegistered', src, resource)
  }, 200)
};

export const validateToken = (src: number, resource: string, token: string) => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Auth: Could not find steamId identifier. Is your steam running?');
    return;
  }
  try {
    const data = verifier(token) as ResourceTokenData;
    if (!data?.steamId || !data?.resource) {
      Admin.ACBan(src, 'Unauthorized event triggering (invalid session token)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a invalid token | token.steamId: ${data.steamId
        } | token.resource: ${data.resource}`
      );
      return false;
    }
    if (data.steamId !== steamId) {
      Admin.ACBan(src, 'Unauthorized event triggering (mismatching steam ids)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a token with mismatching steamIds | ${steamId} vs ${data.steamId}`
      );
      return false;
    }
    if (data.resource !== resource) {
      Admin.ACBan(src, 'Unauthorized event triggering (mismatching resources)');
      mainLogger.info(
        `${GetPlayerName(String(src))} tried to use a token with mismatching resources | ${resource} vs ${data.resource
        }`
      );
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
