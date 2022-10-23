import { Chat, RPC, Util } from '@dgx/server';
import gangManager from 'classes/gangmanager';

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

RPC.register('gangs:server:getCurrentGang', (plyId: number) => {
  const cid = Util.getCID(plyId);
  const gang = gangManager.getPlayerGang(cid);
  return gang?.name ?? null;
});

RPC.register('gangs:server:getClientVersion', async (plyId: number): Promise<GangData | null> => {
  const cid = Util.getCID(plyId);
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return null;
  return await gang.getClientVersion();
});