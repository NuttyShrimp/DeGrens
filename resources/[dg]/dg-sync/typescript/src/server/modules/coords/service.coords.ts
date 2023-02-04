let allPlayerCoords: Record<string, Vec3> = {};

export const syncCoords = () => {
  allPlayerCoords = {};
  for (let i = 0; i < GetNumPlayerIndices(); i++) {
    const plyId = GetPlayerFromIndex(i);
    const ped = GetPlayerPed(plyId);
    const [x, y, z] = GetEntityCoords(ped);
    allPlayerCoords[plyId] = { x, y, z };
  }
  emitNet('sync:coords:sync', -1, allPlayerCoords);
};

export const getPlayerCoords = (plyId: number) => {
  return allPlayerCoords[plyId];
};
