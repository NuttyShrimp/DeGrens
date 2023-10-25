import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import HmacMD5 from 'crypto-js/hmac-md5';

import { Util } from '../index';

const eventHashCache: Record<string, string> = {};
let tokensLoaded = false;

let eventKey: string = '';
let decodeKey: string = '';
let encodeKey: string = '';

export const setKeys = (keys: Auth.SecretKeys) => {
  eventKey = keys.event;
  decodeKey = keys.decode;
  encodeKey = keys.encrypt;
  tokensLoaded = true;
};

export const awaitKeys = async () => {
  const loaded = await Util.awaitCondition(() => tokensLoaded, 60000);
  if (!loaded) {
    console.error('Failed to load keys');
  }
};

const encryptAESPayload = (cipher: string, secret: string) => {
  if (typeof cipher !== 'string' || typeof secret !== 'string') {
    return;
  }
  return AES.encrypt(cipher, secret).toString();
};

export const decryptAESPayload = (cipher: string, secret: string) => {
  if (typeof cipher !== 'string' || typeof secret !== 'string') {
    return;
  }
  return AES.decrypt(cipher, secret).toString(encUtf8);
};

const getEventMD5 = (evtName: string, secret: string) => {
  return HmacMD5(evtName, secret).toString();
};

export const getEventHash = (evtName: string) => {
  if (eventHashCache[evtName] === undefined) {
    eventHashCache[evtName] = getEventMD5(evtName, eventKey);
  }
  return eventHashCache[evtName];
};

// encrypt payload C -> S
export const encryptClientPayload = (data: any) => {
  try {
    return encryptAESPayload(JSON.stringify(data), encodeKey);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to encode payload');
  }
};

// decrypt payload C -> S
export const decryptClientPayload = (payload: string) => {
  try {
    return JSON.parse(decryptAESPayload(payload, encodeKey) ?? '');
  } catch (e) {
    console.error(e);
    throw new Error('Failed to decrypt payload');
  }
};

export const encryptServerPayload = (data: any) => {
  try {
    return encryptAESPayload(JSON.stringify(data), decodeKey);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to decrypt payload');
  }
};

export const decryptServerPayload = (payload: string) => {
  try {
    return JSON.parse(decryptAESPayload(payload, decodeKey) ?? '');
  } catch (e) {
    console.error(e);
    throw new Error('Failed to encode payload');
  }
};
