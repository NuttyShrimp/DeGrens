import { Chat, Core, RPC, Util } from '@dgx/server';
import gangManager from 'classes/gangmanager';
import { dispatchCurrentGangToClient } from 'helpers';

Chat.registerCommand(
  'createGang',
  'Create a new gang',
  [
    {
      name: 'name',
      description: 'Name of gang',
    },
    {
      name: 'label',
      description: 'label of gang',
    },
    {
      name: 'cid',
      description: 'CitizenID of owner',
    },
  ],
  'developer',
  (src, _, params) => {
    const cid = Number(params[2]);
    if (isNaN(cid)) {
      throw new Error('CitizenId should be a valid integer');
    }
    gangManager.createGang(params[0], params[1], cid);
  }
);

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

Core.onPlayerLoaded(playerData => {
  const gang = gangManager.getPlayerGang(playerData.citizenid);
  if (!gang) return;
  dispatchCurrentGangToClient(playerData.citizenid, gang.name);
});

RPC.register('gangs:server:getForAdmin', () => {
  return gangManager.getGangs();
});
