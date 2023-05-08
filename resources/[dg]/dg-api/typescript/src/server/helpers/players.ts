import { Core } from '@dgx/server';

export const getAPIPlayer = (src: number): API.Player => {
  const Player = Core.getPlayer(src);
  return {
    source: src,
    cid: Player?.citizenid ?? 0,
    firstname: Player?.charinfo?.firstname ?? GetPlayerName(String(src)),
    lastname: Player?.charinfo?.lastname ?? '',
  };
};
