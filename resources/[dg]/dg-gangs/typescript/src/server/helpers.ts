import { Events } from '@dgx/server';
import gangManager from 'classes/gangmanager';
import { charModule } from 'services/core';

// Dispatch to client to keep cache of current gang
export const dispatchCurrentGangToClient = (cid: number, newGang: string | null) => {
  const plyId = charModule.getServerIdFromCitizenId(cid);
  if (!plyId) return;
  Events.emitNet('gangs:client:updateCurrentGang', plyId, newGang);
};

export const dispatchCurrentGangToAllClients = () => {
  Object.values(charModule.getAllPlayers()).forEach(ply => {
    const gang = gangManager.getPlayerGang(ply.citizenid);
    if (!gang) return;
    dispatchCurrentGangToClient(ply.citizenid, gang.name);
  });
};
