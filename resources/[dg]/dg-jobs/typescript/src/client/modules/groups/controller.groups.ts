import { Events, RPC, UI } from '@dgx/client';

// region nui
UI.RegisterUICallback('phone/jobs/groups/get', async (_, cb) => {
  const groups = await RPC.execute<JobGroup[]>('dg-jobs:server:groups:get');
  cb({ data: groups, meta: { ok: true, message: 'done' } });
});
UI.RegisterUICallback('phone/jobs/groups/create', async (_, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:create');
  cb({ data: {}, meta: { ok: isSuccess ?? false, message: isSuccess ? 'done' : 'Failed to create jobgroup' } });
});
UI.RegisterUICallback('phone/jobs/groups/join', async (data: { id: string }, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:joinRequest', data.id);
  cb({ data: {}, meta: { ok: isSuccess ?? false, message: isSuccess ? 'done' : 'Failed to join jobgroup' } });
});
UI.RegisterUICallback('phone/jobs/groups/leave', async (_, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:leave');
  cb({ data: {}, meta: { ok: isSuccess ?? false, message: isSuccess ? 'done' : 'Failed to leave jobgroup' } });
});
UI.RegisterUICallback('phone/jobs/groups/members', async (_, cb) => {
  const members = await RPC.execute('dg-jobs:server:groups:getMembers');
  cb({ data: members, meta: { ok: true, message: 'done' } });
});
UI.RegisterUICallback('phone/jobs/groups/kick', async (data: { cid: number }, cb) => {
  await RPC.execute('dg-jobs:server:groups:kick', data.cid);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
UI.RegisterUICallback('phone/jobs/group/setReady', async (data: { ready: boolean }, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:setReady', data.ready);
  cb({ data: {}, meta: { ok: isSuccess ?? false, message: isSuccess ? 'done' : 'Failed to set ready' } });
});
UI.RegisterUICallback('phone/jobs/get', async (_, cb) => {
  const jobs = await RPC.execute('dg-jobs:server:jobs:get');
  cb({ data: jobs, meta: { ok: true, message: 'done' } });
});
UI.RegisterUICallback('phone/jobs/waypoint', async (data: { job: string }, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:jobs:waypoint', data.job);
  cb({ data: {}, meta: { ok: isSuccess ?? false, message: isSuccess ? 'done' : 'Failed to set waypoint' } });
});
// endregion
// region events
UI.onLoad(() => {
  emitNet('dg-jobs:client:groups:seedStore');
});

Events.onNet('dg-jobs:client:groups:isFull', () => {
  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'groupIsFull',
  });
});

// update ui store
Events.onNet('dg-jobs:client:groups:updateStore', (data: UIStoreData) => {
  if (data.currentGroup === null) {
    //@ts-ignore fuckoff man klote ding
    data.currentGroup = 'null';
  }

  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'updateStore',
    data,
  });
});
// endregion
