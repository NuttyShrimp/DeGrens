import { Admin, Core, Util, lib } from '@dgx/server';
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import encBase64 from 'crypto-js/enc-base64';
import { getPlySteamId } from './steamids';
import { isResourceKnown } from 'helpers/resources';
import { mainLogger } from 'sv_logger';

let srvStarted = false;

setImmediate(() => {
  srvStarted = true;
});

// Encryption storage logic
let secrets: Auth.SecretKeys = {
  event: Util.getRndString(16, true),
  encrypt: Util.getRndString(16, true),
  decode: Util.getRndString(16, true),
};

SetResourceKvp('secrets', JSON.stringify(secrets));
// Restore keys on restart
if (GetResourceState('ts-shared') !== 'stopped') {
  const secretStr = GetResourceKvpString('secrets');
  let savedSecrets = JSON.parse(secretStr);
  if (!savedSecrets?.event || !savedSecrets?.encrypt || !savedSecrets?.decode) {
    console.error('Failed to retrieve stored secrets');
  } else {
    secrets = savedSecrets;
  }
}

const getKeysForServer = () => {
  return secrets;
};

const getKeysForClient = (token: string) => {
  // key cipher: e57gfqvxdtam5lnqqpykun4a
  const secret = [secrets.event, secrets.decode, secrets.encrypt].map(k => AES.encrypt(k, token).toString()).join(':');
  return encBase64.stringify(encUtf8.parse(secret));
};

lib<'dg-auth'>('getKeysForServer', getKeysForServer);

// map key to resource name
const authenticationQueue: { target: number; steamId: string; resource: string }[] = [];
let authThreadRunning = false;

onNet('__dgx_auth_init', (resName: string) => {
  const src = +source;
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Auth: Could not find steamId identifier. Is your steam running?');
    return;
  }

  if (Util.isDevEnv()) {
    receivedToken.delete(`${steamId}-${src}`);
  }

  if (!resName) {
    Admin.ACBan(Number(src), 'Failed to properly authenticate resource (N)');
    return;
  }
  if (GetResourceState(resName) !== 'started' || !isResourceKnown(resName)) {
    Admin.ACBan(Number(src), 'Failed to properly authenticate resource (RS)');
    return;
  }

  authenticationQueue.push({
    target: src,
    steamId,
    resource: resName,
  });

  if (authThreadRunning) {
    return;
  }

  traverseAuthQueue();
});

const traverseAuthQueue = () => {
  if (authenticationQueue.length === 0) {
    authThreadRunning = false;
    return;
  }
  const entry = authenticationQueue.shift();
  if (!entry) return;

  const plyRecvTokens = receivedToken.get(`${entry.steamId}-${entry.target}`);
  if (plyRecvTokens && plyRecvTokens.has(entry.resource)) {
    Admin.ACBan(Number(entry.target), 'Failed to properly authenticate resource (RT)', { resName: entry.resource });
    return;
  }

  sendRetrieveKeysTokenToResource(Number(entry.target), entry.resource);

  traverseAuthQueue();
};

// Sending secrets to resources logic
let pendingTokens = new Map<string, Map<string, string>>();
let receivedToken = new Map<string, Map<string, string>>();

const sendRetrieveKeysTokenToResource = (src: number, res: string) => {
  const userModule = Core.getModule('users');
  let token = Util.uuidv4();
  const steamId = userModule.getPlyIdentifiers(src).steam;
  let validToken = false;
  while (!validToken) {
    let changed = false;
    for (const pTokens of pendingTokens.values()) {
      if (token === pTokens.get(res)) {
        token = Util.uuidv4();
        changed = true;
      }
    }
    validToken = !changed;
  }

  const plyTokens = pendingTokens.get(`${steamId}-${src}`) || new Map<string, string>();
  plyTokens.set(res, token);
  pendingTokens.set(`${steamId}-${src}`, plyTokens);

  const encToken = Util.getRndString(16, true);

  // console.log(`Sending token to ${src} for ${res} ${token}`);

  const eventHandler = (resName: string) => {
    const src = +source;
    const steamId = userModule.getPlyIdentifiers(src).steam;
    const storedTokens = pendingTokens.get(`${steamId}-${src}`);
    if (!storedTokens) {
      Admin.ACBan(Number(src), 'Failed to properly authenticate resource (ST)', { resource: res });
      return;
    }
    const storedToken = storedTokens.get(resName);
    if (!storedToken && !token) {
      mainLogger.error('We are doing authentication for a non-initiated resource', { resource: res });
      return;
    }

    let plyTokens = receivedToken.get(`${steamId}-${src}`);

    if ((!storedToken || storedToken !== token) && !(plyTokens?.get(resName) === token)) {
      Admin.ACBan(Number(src), 'Authentication token mismatch (SYN ACK)', { storedToken, token, resource: res });
      return;
    }
    // Right token for right resource, send secrets to event
    emitNet(`__dgx_auth_res:${token}`, src, getKeysForClient(encToken));
    removeEventListener(`__dgx_auth_req:${token}`, eventHandler);
    storedTokens.delete(resName);

    plyTokens = receivedToken.get(`${steamId}-${src}`) || new Map<string, string>();
    plyTokens.set(resName, token);
    receivedToken.set(`${steamId}-${src}`, plyTokens);
    setTimeout(() => {
      emit('dg-auth:token:resourceRegistered', +src, resName);
    }, 200);
  };
  onNet(`__dgx_auth_req:${token}`, eventHandler);
  emitNet(`__dgx_auth:${res}`, src, token, encToken);
};

export const removeResourceToken = (res: string) => {
  pendingTokens.forEach((tokens, key) => {
    if (tokens.has(res)) {
      tokens.delete(res);
      if (tokens.size === 0) {
        pendingTokens.delete(key);
      }
    }
  });
  receivedToken.forEach((tokens, key) => {
    if (tokens.has(res)) {
      tokens.delete(res);
      if (tokens.size === 0) {
        receivedToken.delete(key);
      }
    }
  });
};

export const cleanupPlayer = (src: number) => {
  const userModule = Core.getModule('users');
  const steamId = userModule.getPlyIdentifiers(src).steam;
  if (!steamId) return;
  pendingTokens.delete(`${steamId}-${src}`);
  receivedToken.delete(`${steamId}-${src}`);
};
