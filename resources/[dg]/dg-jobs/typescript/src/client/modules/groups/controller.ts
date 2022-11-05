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
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:joinRequest', data);
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
// TODO: add backend receiver
UI.RegisterUICallback('phone/jobs/groups/kick', async (data: { name: string }, cb) => {
  await RPC.execute('dg-jobs:server:groups:kick', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
UI.RegisterUICallback('phone/jobs/group/setReady', async (data: { ready: boolean }, cb) => {
  const isSuccess = await RPC.execute<boolean>('dg-jobs:server:groups:setReady', data);
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
on('dg-ui:loadData', () => {
  emitNet('dg-jobs:client:groups:loadStore');
});

on('DGCore:client:playerLoaded', () => {
  emitNet('dg-jobs:client:groups:loadStore');
});

Events.onNet('dg-jobs:client:groups:isFull', () => {
  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'groupIsFull',
  });
});

// Set the current group the player is part of
Events.onNet('dg-jobs:client:groups:set', (group: JobGroup | null) => {
  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'setCurrentGroup',
    data: group,
  });
});

// Set the members of the current group
Events.onNet('dg-jobs:client:groups:setMembers', (members: JobGroupMember[]) => {
  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'setMembers',
    data: members,
  });
});

// Set if this player is the owner/creator of the group
Events.onNet('dg-jobs:client:groups:setGroupOwner', (isOwner: boolean) => {
  UI.SendAppEvent('phone', {
    appName: 'jobcenter',
    action: 'setOwner',
    data: isOwner,
  });
});

Events.onNet('dg-jobs:client:jobs:waypoint', (loc: { x: number; y: number }) => {
  DeleteWaypoint();
  ClearGpsPlayerWaypoint();
  SetNewWaypoint(loc.x, loc.y);
});
// endregion
