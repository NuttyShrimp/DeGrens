let PlayerData: PlayerData | null = null;
let plyJob: { name: string | null; grade: number } = null;
const registeredFlags: Set<string> = new Set();

export const getEntityCtx = (entity: number, entityType: number): Context => {
  const ctx: Context = {
    entity,
    netId: null,
    type: entityType,
    globalType: null,
    model: GetEntityModel(entity),
    flags: new Set(),
  };

  if (NetworkGetEntityIsNetworked(entity)) {
    ctx.netId = NetworkGetNetworkIdFromEntity(entity);
  }

  if (entityType === 1) {
    if (IsPedAPlayer(ctx.entity)) {
      ctx.globalType = 'player';
      const cfxPly = Player(GetPlayerServerId(NetworkGetPlayerIndexFromPed(ctx.entity)));
      registeredFlags.forEach(flag => {
        if (!cfxPly.state[flag]) return;
        ctx.flags.add(flag);
      });
    } else {
      ctx.globalType = 'ped';
    }
  } else if (entityType === 2) {
    ctx.globalType = 'vehicle';
  }

  const cfxEntity = Entity(ctx.entity);
  registeredFlags.forEach(flag => {
    if (!cfxEntity.state[flag]) return;
    if (ctx.flags.has(flag)) return;
    ctx.flags.add(flag);
  });

  return ctx;
};

export const addCtxFlag = (flag: string) => {
  if (!registeredFlags.has(flag)) {
    registeredFlags.add(flag);
  }
};

export const setCtxPlayerData = (data: PlayerData) => {
  PlayerData = data;
};

export const setCtxJob = (job: { name: string | null; grade: number } | null) => {
  plyJob = job;
};

export const getCtxPlayerData = (): { data: PlayerData; job: { name: string | null; grade: number } } => {
  return {
    data: PlayerData,
    job: plyJob,
  };
};
