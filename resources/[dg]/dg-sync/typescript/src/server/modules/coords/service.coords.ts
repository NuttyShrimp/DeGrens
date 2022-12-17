import { Util } from '@dgx/server';

let allPlayerCoords: Record<number, Vec3> = {};

export const syncCoords = () => {
  allPlayerCoords = {};
  for (let i = 0; i < GetNumPlayerIndices(); i++) {
    const plyId = Number(GetPlayerFromIndex(i));
    if (!plyId) continue;
    allPlayerCoords[plyId] = Util.getPlyCoords(plyId);
  }
  emitNet('sync:coords:sync', -1, allPlayerCoords);
};

export const getPlayerCoords = (plyId: number) => {
  return allPlayerCoords[plyId];
};
