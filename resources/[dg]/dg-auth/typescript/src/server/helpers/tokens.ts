import { Util } from '@dgx/server/classes';
import jwt from 'jsonwebtoken';
import { mainLogger } from "../sv_logger";
import { getPlySteamId } from '../sv_util';
import { handlePlayerJoin } from './events';

const PRIV_KEY = '5bf75100c991840f10b155d6b53806f6553887eee94845a3338a6b11e082cf629cb89983e0d019e9ba8dd70e27f54c5a4b6f3943210b2369bb699181771baa0f'
const tokenMap: Map<string, PlyData> = new Map();

// TODO: Use the timestamp to detect invalid keys from restarted resources

export const getPlyToken = (src: number): string => {
  for (const plyToken of tokenMap.keys()) {
    const plyData = tokenMap.get(plyToken);
    if (plyData.source === src) {
      return jwt.sign(plyToken, PRIV_KEY, {
        algorithm: 'HS512',
      });
    }
  }
}

export const generateToken = (src: number) => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    DropPlayer(String(src), 'Couldn\'t get steamid for server authentication, please start steam');
  }
  // The id where the data is hidden behind, if the player finds our key it will be almost wortheless :)
  let plyKey = Util.uuidv4();
  while (tokenMap.has(plyKey)) {
    plyKey = Util.uuidv4();
  }
  const data = {
    timeStamp: Date.now(),
    source: Number(src),
    steamId
  }
  tokenMap.set(plyKey, data);
  const token = jwt.sign(plyKey, PRIV_KEY, {
    algorithm: 'HS512',
  });
  // TODO: Check if this needs a timeout to prevent useless regeneration of maps for the first player
  // TODO: await on all returns of the map generation, max span of 10 seconds to generate all maps --> Drop player if it takes too long
  handlePlayerJoin(src, steamId)
  emitNet('__dg_auth_authenticated', src, -1, token);
}

export const getPlayerInfo = (src: number, token: string) => {
  try {
    const srvToken = jwt.verify(token, PRIV_KEY,{
      algorithms: ['HS512'],
    }) as PlyData;
    const plyData = tokenMap.get(String(srvToken));
    if (Number(plyData.source) !== Number(src)) {
      throw new Error('token not bound to player')
    }
    return plyData;
  } catch (e) {
    // TODO: Add ban
    mainLogger.warn(`[${GetInvokingResource()}] ${GetPlayerName(String(src))}(${src}) has tried to use an invalid token (${e.message})`)
    return;
  }
}