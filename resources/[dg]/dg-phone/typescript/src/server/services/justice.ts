import { Events, Financials, Jobs, RPC } from '@dgx/server';
import { charModule } from 'helpers/core';
import { mainLogger } from 'sv_logger';

const registered: Record<string, JusticeState[]> = {
  judge: [],
  lawyer: [],
};

setImmediate(() => {
  for (const key in registered) {
    seedJob(key);
  }
});

const seedJob = (job: string) => {
  Object.values(charModule.getAllPlayers()).forEach(ply => {
    const plyJob = Jobs.getCurrentJob(ply.serverId);
    if (plyJob !== job) return;
    registered[job].push({
      srvId: ply.serverId,
      name: `${ply.charinfo.firstname} ${ply.charinfo.lastname}`,
      phone: ply.charinfo.phone,
      available: true,
    });
  });
};

const removeFromRegistered = (plyId: number) => {
  Object.keys(registered).forEach(job => {
    registered[job] = registered[job].filter(state => state.srvId !== plyId);
  });
};

const setPlyAvailable = (src: number, isAvailable: boolean) => {
  Object.values(registered).forEach(plys => {
    const plyState = plys.find(state => state.srvId === src);
    if (!plyState) return;
    plyState.available = isAvailable;
  });
};
on('jobs:server:signin:update', (src: number, job: string) => {
  removeFromRegistered(src);
  if (!registered[job]) return;
  // If somehow the player is already registered for this job update the available
  let updated = false;
  registered[job].forEach(state => {
    if (state.srvId === src) {
      state.available = false;
      updated = true;
    }
  });
  if (updated) return;
  const ply = charModule.getPlayer(src);
  if (!ply) {
    mainLogger.warn(`Failed to register player(${src}) as active ${job} in justice app`);
    return;
  }
  registered[job].push({
    srvId: ply.serverId,
    name: `${ply.charinfo.firstname} ${ply.charinfo.lastname}`,
    phone: ply.charinfo.phone,
    available: true,
  });
});

RPC.register('phone:justice:get', () => {
  return registered;
});

Events.onNet('phone:justice:setAvailable', (src, data: { available: boolean }) => {
  setPlyAvailable(src, data.available);
});

Events.onNet('phone:justice:giveFine', (src, data: { citizenid: string; amount: string; comment?: string }) => {
  const plyJob = Jobs.getCurrentJob(src);
  if (!plyJob || !registered[plyJob]) return;

  const cid = Player(src).state.citizenid;
  const recvAccId = Financials.getDefaultAccountId(cid);
  if (!recvAccId) return;

  Financials.giveFine(
    Number(data.citizenid),
    recvAccId,
    Number(data.amount),
    `Jusitie kosten: ${data?.comment ?? 'No comment'}`,
    'Justitie DeGrens',
    cid
  );
});
