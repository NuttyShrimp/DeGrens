import { Events } from '@dgx/server';
import gangManager from 'classes/gangmanager';

// Dispatch to client to keep cache of current gang
export const dispatchCurrentGangToClient = (cid: number, newGang: string | null) => {
  const player = DGCore.Functions.GetPlayerByCitizenId(cid);
  if (!player) return;
  Events.emitNet('gangs:client:updateCurrentGang', player.PlayerData.source, newGang);
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
