import { Events, Peek, PolyTarget, UI } from '@dgx/client';

const currentJob: { name: string | null; rank: number | null } = { name: null, rank: null };

Events.onNet('jobs:client:buildSignInLocations', (locations: SignInLocation[]) => {
  locations.forEach(({ zone }) => {
    PolyTarget.addBoxZone('jobs:signin', zone.vector, zone.width, zone.length, zone.data, true);
  });
});

onNet('jobs:client:signin:update', (job: string, rank: number) => {
  currentJob.name = job;
  currentJob.rank = rank;
});

export const getCurrentJob = () => currentJob;

Peek.addZoneEntry(
  'jobs:signin',
  {
    distance: 2,
    options: [
      {
        label: 'Open Duty Board',
        icon: 'list-check',
        action: option => {
          Events.emitNet('jobs:server:signIn:openDutyBoard', option.data?.id ?? -1);
        },
      },
    ],
  },
  true
);

UI.RegisterUICallback('jobs:signin:signin', (data: { job: string }, cb) => {
  Events.emitNet('jobs:server:signIn', data.job);
  cb({ meta: { ok: true, message: '' }, data: {} });
});

UI.RegisterUICallback('jobs:signin:signout', (data: { job: string }, cb) => {
  Events.emitNet('jobs:server:signOut', data.job);
  cb({ meta: { ok: true, message: '' }, data: {} });
});

UI.RegisterUICallback('jobs:whitelist:assignRank', (data: { rank: number; cid: number }, cb) => {
  Events.emitNet('jobs:whitelist:server:assignRank', data.cid, data.rank);
  cb({ meta: { ok: true, message: '' }, data: {} });
});

UI.RegisterUICallback(
  'jobs:whitelist:toggleSpecialty',
  (data: { cid: number; spec: string; type: 'add' | 'remove' }, cb) => {
    Events.emitNet('jobs:whitelist:toggleSpecialty', data.cid, data.spec, data.type);
    cb({ meta: { ok: true, message: '' }, data: {} });
  }
);

UI.RegisterUICallback('jobs:whitelist:filter', (data: { spec: string; filter: string; type: 'add' | 'remove' }, cb) => {
  let filter = data.filter;
  if (data.type === 'add') {
    filter = `${filter};${data.spec}`;
  }
  if (data.type === 'remove') {
    filter = filter
      .split(';')
      .filter(f => f !== data.spec)
      .join(';');
  }
  Events.emitNet('jobs:whitelist:server:openJobAllowlist', filter);
  cb({ meta: { ok: true, message: '' }, data: {} });
});

UI.RegisterUICallback('jobs:whitelist:hire', async (data: { job: string }, cb) => {
  cb({ data: {}, meta: { ok: true, message: '' } });
  const inputData = await UI.openInput({
    header: 'Neem persoon aan',
    inputs: [
      {
        label: 'CID',
        name: 'cid',
        type: 'number',
      },
    ],
  });
  const cid = Number(inputData.values['cid']);
  if (!inputData.accepted || Number.isNaN(cid) || cid < 1000) {
    return;
  }
  Events.emitNet('jobs:whitelist:hire', data.job, cid);
});

UI.RegisterUICallback('jobs:whitelist:fire', async (data: { job: string; cid: number }, cb) => {
  cb({ data: {}, meta: { ok: true, message: '' } });
  const inputData = await UI.openInput({
    header: `Weet je zeker dat je persoon met CID ${data.cid} wilt ontslaan?`,
  });
  if (!inputData.accepted) return;
  Events.emitNet('jobs:whitelist:fire', data.job, data.cid);
});
