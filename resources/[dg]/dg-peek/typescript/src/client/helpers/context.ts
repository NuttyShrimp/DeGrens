const registeredFlags: Set<string> = new Set();

export const getEntityCtx = (entity: number): Context => {
  const entityType = GetEntityType(entity);
  const ctx: Context = {
    entity,
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
