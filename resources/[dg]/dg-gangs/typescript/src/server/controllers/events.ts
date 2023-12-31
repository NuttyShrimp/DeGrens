import { Core, RPC, Util } from '@dgx/server';
import gangManager from 'classes/gangmanager';
import { dispatchCurrentGangToClient } from 'helpers';

RPC.register('gangs:server:getData', async (plyId: number): Promise<Gangs.Data | null> => {
  const cid = Util.getCID(plyId);
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return null;
  const clientVersion = await gang.getData();
  return clientVersion;
});

RPC.register(
  'gangs:server:getFeedMessages',
  (plyId: number, gangName: string, offset: number): Gangs.Feed.Message[] => {
    const gang = gangManager.getGang(gangName);
    if (!gang) return [];
    return gang.getFeedMessages(offset);
  }
);

RPC.register('gangs:server:getChatMsgs', (plyId: number) => {
  const cid = Util.getCID(plyId);
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return [];
  return gang.getChatMessages();
});

Core.onPlayerLoaded(playerData => {
  const gang = gangManager.getPlayerGang(playerData.citizenid);
  if (!gang) return;
  dispatchCurrentGangToClient(playerData.citizenid, gang.name);
});

RPC.register('gangs:server:getForAdmin', () => {
  return gangManager.getGangs();
});

RPC.register('gangs:server:postChatMsg', (plyId: number, message: string) => {
  const cid = Util.getCID(plyId);
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return;
  gang.postChatMessage(cid, message);
});
