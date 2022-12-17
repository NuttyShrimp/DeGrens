import { Util } from '@dgx/client';

let allPlayerCoords: Record<number, Vec3> = {};

export const setAllPlayerCoords = (coords: typeof allPlayerCoords) => {
  allPlayerCoords = coords;
};

export const getAllPlayerCoords = () => {
  return allPlayerCoords;
};

export const getPlayerCoords = (plyId: number) => {
  const playerIndex = GetPlayerFromServerId(plyId);
  return playerIndex !== 1 ? Util.getEntityCoords(GetPlayerPed(playerIndex)) : allPlayerCoords[plyId];
};
