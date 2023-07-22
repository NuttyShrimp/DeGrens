import { Events, Util } from '@dgx/server';
import { getPrivateToken } from 'helpers/privateToken';
import { createSigner, createVerifier } from 'fast-jwt';
import { mainLogger } from 'sv_logger';
import { getPlyServerId } from './steamids';

const revokedTokens = new Set<string>();
let signer: any;
let verifier: any;
let panelEndpoint: string | null;

export const setPanelEndpoint = (endpoint: string) => {
  panelEndpoint = endpoint;
};

export const createPanelJWSHandlers = () => {
  signer = createSigner({
    // Normally on 12 hours needed but is as safety measurement when server skips a restart or so
    expiresIn: 1000 * 60 * 60 * 25,
    key: getPrivateToken(),
  });

  verifier = createVerifier({
    key: getPrivateToken(),
  });
};

export const generatePanelToken = async (src: number) => {
  await Util.awaitCondition(
    () => Player(src)?.state?.steamId && Player(src)?.state?.steamId !== null && Player(src)?.state?.steamId !== '',
    60000
  );
  if (Util.isDevEnv()) return;
  const steamId = Player(src).state.steamId;
  const token = signer({ steamId });
  if (revokedTokens.has(token)) {
    revokedTokens.delete(token);
  }
  mainLogger.debug(`Generated panel token for ${steamId} -> ${token}`);
  Events.emitNet('auth:panel:init', src, {
    token,
    endpoint: panelEndpoint,
    steamId,
  });
};

export const removePanelToken = (token: string) => {
  revokedTokens.add(token);
  mainLogger.debug(`revoked panel token: ${token}`);
};

export const getSteamIdFromPanelToken = (token: string) => {
  try {
    if (revokedTokens.has(token)) {
      console.log(`${token} is revoken`);
      return null;
    }
    const panelObject = verifier(token);
    if (!panelObject) return null;
    const { steamId } = panelObject;
    let serverId = getPlyServerId(steamId);
    if (!serverId) return null;
    return steamId;
  } catch (e) {
    console.log(token, e);
    return null;
  }
};
