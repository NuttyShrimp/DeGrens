import { Events } from '@dgx/server';
import gangManager from 'classes/gangmanager';

// Dispatch to client to keep cache of current gang
export const dispatchCurrentGangToClient = (cid: number, newGang: string | null) => {
  const plyId = DGCore.Functions.getPlyIdForCid(cid);
  if (!plyId) return;
  Events.emitNet('gangs:client:updateCurrentGang', plyId, newGang);
};

export const dispatchCurrentGangToAllClients = () => {
  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach((ply: Player) => {
    const gang = gangManager.getPlayerGang(ply.PlayerData.citizenid);
    if (!gang) return;
    dispatchCurrentGangToClient(ply.PlayerData.citizenid, gang.name);
  });
};
