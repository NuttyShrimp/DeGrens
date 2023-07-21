import { Events, Financials, Jobs, Notifications, RPC, Inventory } from '@dgx/server';
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

Jobs.onJobUpdate((plyId, job) => {
  removeFromRegistered(plyId);
  if (!job || !registered[job]) return;

  // If somehow the player is already registered for this job update the available
  let updated = false;
  registered[job].forEach(state => {
    if (state.srvId === plyId) {
      state.available = false;
      updated = true;
    }
  });
  if (updated) return;

  const ply = charModule.getPlayer(plyId);
  if (!ply) {
    mainLogger.warn(`Failed to register player(${plyId}) as active ${job} in justice app`);
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

RPC.register('phone:justice:setAvailable', (src, available: boolean) => {
  setPlyAvailable(src, available);
});

Events.onNet(
  'phone:justice:giveFine',
  (src, strTargetCid: number | string, strAmount: number | string, comment?: string) => {
    const targetCid = +strTargetCid;
    const amount = +strAmount;
    if (isNaN(targetCid) || isNaN(amount)) {
      Notifications.add(src, 'CID of aantal was geen nummer', 'error');
      return;
    }

    const plyJob = Jobs.getCurrentJob(src);
    if (!plyJob || !registered[plyJob]) {
      Notifications.add(src, 'Je bent niet in dienst bij een job die hier toegang tot heeft', 'error');
      return;
    }

    const cid = Player(src).state.citizenid;
    const recvAccId = Financials.getDefaultAccountId(cid);
    if (!recvAccId) {
      Notifications.add(src, 'Je hebt geen bankrekening', 'error');
      return;
    }

    Financials.giveFine(
      targetCid,
      recvAccId,
      amount,
      `Jusitie kosten: ${comment ?? 'No comment'}`,
      'Justitie DeGrens',
      cid
    );
    Notifications.add(src, 'Betaalverzoek verzonden', 'success');
  }
);
