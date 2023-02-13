import { Util } from '@dgx/server';
import { getPrivateToken } from 'helpers/privateToken';
import { createSigner, createVerifier } from 'fast-jwt';

const revokedTokens = new Set<string>();
let signer: any;
let verifier: any;

export const createPanelJWSHandlers = () => {
  signer = createSigner({
    // Normally on 12 hours needed but is as safety measurement when server skips a restart or so
    expiresIn: 1000 * 60 * 60 * 25,
    key: getPrivateToken(),
    algorithm: 'HS256',
  });

  verifier = createVerifier({
    key: getPrivateToken(),
    algorithms: ['HS256'],
  });
};

export const generatePanelToken = async (src: number) => {
  await Util.awaitCondition(() => !Player(src)?.state?.steamId);
  const steamId = Player(src).state.steamId;
  const token = signer(steamId);
  if (revokedTokens.has(token)) {
    revokedTokens.delete(token);
  }
  return token;
};

export const removePanelToken = (token: string) => {
  revokedTokens.add(token);
};

export const getSteamIdFromPanelToken = async (token: string) => {
  try {
    if (revokedTokens.has(token)) {
      return null;
    }
    let steamId = verifier(token);
    let serverId = await global.exports['dg-auth'].getServerIdForSteamId(steamId);
    if (!serverId) return null;
    return steamId;
  } catch {
    return null;
  }
};
