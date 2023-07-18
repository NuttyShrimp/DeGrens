// exports (even calling functions from exported core modules) & statebags are really expansive compared to just doing it in same resource
// as the validate resource export function is one of the most called exports in the codebase (every event/rpc) we dont want to really use statebags in that shit to get steamId

import { Admin } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const steamIdCache = new Map<number, string>();

AddStateBagChangeHandler(
  'steamId',
  null as any,
  (bagName: string, _key: unknown, steamId: string, __: unknown, replicated: boolean) => {
    const plyId = +bagName.replace('player:', '');
    if (isNaN(plyId)) {
      mainLogger.error(`Could not get serverId of steamId statebag bagname ${bagName}`);
      return;
    }

    if (replicated) {
      Admin.ACBan(plyId, 'Tried to change steamId statebag from client');
      return;
    }

    if (!steamId.startsWith('steam')) {
      mainLogger.error(`SteamId ${steamId} was not a valid steam identifier`);
      return;
    }

    steamIdCache.set(plyId, steamId);
    mainLogger.debug(`Cached steamId ${steamId} for player ${plyId}`);
  }
);

on('playerDropped', () => {
  steamIdCache.delete(source);
});

export const getPlySteamId = (plyId: number) => steamIdCache.get(plyId);

export const getPlyServerId = (steamId: string) => {
  for (const [serverId, plySteamId] of steamIdCache) {
    if (plySteamId === steamId) {
      return serverId;
    }
  }
};
