import { RPC, UI } from '@dgx/client';
import { FEED_MESSAGES_BATCH } from '../../shared/constants';

UI.RegisterUICallback('laptop/gang/fetch', async (_, cb) => {
  const cid = LocalPlayer.state.citizenid;
  const clientVersion = await RPC.execute<Gangs.Data | null>('gangs:server:getData');
  // generate some extra fields for easy usage in ui
  let data = null;
  if (clientVersion !== null) {
    data = {
      ...clientVersion,
      members: clientVersion.members.map(m => ({
        ...m,
        isOwner: m.cid === clientVersion.owner,
        isPlayer: m.cid === cid,
      })),
    };
  }
  cb({ data, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/leave', async (data: { gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:leave', data.gang);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/kick', async (data: { cid: number; gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:kick', data.gang, data.cid);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/promote', async (data: { cid: number; gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:promote', data.gang, data.cid);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/degrade', async (data: { cid: number; gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:degrade', data.gang, data.cid);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/transfer', async (data: { cid: number; gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:transfer', data.gang, data.cid);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/add', async (data: { cid: number; gang: string }, cb) => {
  const success = await RPC.execute<boolean>('gangs:server:add', data.gang, data.cid);
  cb({ data: { success: success ?? false }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/gang/getFeedMessages', async (data: { gang: string; offset: number }, cb) => {
  const feedMessages =
    (await RPC.execute<Gangs.Feed.Message[] | undefined>('gangs:server:getFeedMessages', data.gang, data.offset)) ?? [];
  cb({
    data: { feedMessages, canLoadMore: feedMessages.length === FEED_MESSAGES_BATCH },
    meta: { ok: true, message: 'done' },
  });
});
