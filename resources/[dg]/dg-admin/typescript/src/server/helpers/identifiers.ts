import { Util } from '@dgx/server';
import { userModule } from './core';

export const getIdentifierForPlayer = (source: number, identifier: string) => {
  return userModule.getPlyIdentifiers(source)[identifier];
};

export const getUserData = (src: number): UserData => {
  return {
    steamId: getIdentifierForPlayer(src, 'steam')!,
    source: src,
    name: GetPlayerName(String(src)),
    cid: Util.getCID(src, true),
  };
};
