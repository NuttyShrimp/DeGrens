import { Core, Events } from '@dgx/server';
import gangManager from 'classes/gangmanager';

// Dispatch to client to keep cache of current gang
export const dispatchCurrentGangToClient = (cid: number, newGang: string | null) => {
  let charModule = Core.getModule('characters');
  const plyId = charModule.getServerIdFromCitizenId(cid);
  if (!plyId) return;
  Events.emitNet('gangs:client:updateCurrentGang', plyId, newGang);
};

export const dispatchCurrentGangToAllClients = () => {
  let charModule = Core.getModule('characters');
  Object.values(charModule.getAllPlayers()).forEach(ply => {
    const gang = gangManager.getPlayerGang(ply.citizenid);
    if (!gang) return;
    dispatchCurrentGangToClient(ply.citizenid, gang.name);
  });
};
