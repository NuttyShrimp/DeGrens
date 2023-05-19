import { RPC, Sync, Admin, Events, Util } from '@dgx/server';

const VISIBLE_SCOPE_TYPE: Set<Sync.Scopes.Type> = new Set(['dropped']);

const plyOpeningTime = new Map<number, string>();

RPC.register('misc:idlist:getData', (plyId: number) => {
  const fullScopeInfo = Sync.getPlayerScope(plyId);
  const isAdmin = Admin.hasPermission(plyId, 'support');
  const hiddenPlys = Admin.getHiddenPlys();

  // Filter only visible scope
  const scopeInfo = (Object.entries(fullScopeInfo) as [Sync.Scopes.Type, Sync.Scopes.Player[]][]).reduce<
    Partial<Record<Sync.Scopes.Type, Sync.Scopes.Player[]>>
  >((acc, [type, scope]) => {
    if (VISIBLE_SCOPE_TYPE.has(type)) {
      acc[type] = scope;
    }
    return acc;
  }, {});

  // due to latency, this event can fire multiple times before it gets cleared again
  // we treat that opening one time
  if (!plyOpeningTime.has(plyId)) {
    const d = new Date();
    plyOpeningTime.set(plyId, d.toLocaleString());
  }

  return {
    scopeInfo,
    isAdmin,
    hiddenPlys,
  };
});

Events.onNet('misc:idlist:close', (plyId: number) => {
  const openingTime = plyOpeningTime.get(plyId);
  if (!openingTime) return;

  plyOpeningTime.delete(plyId);

  const d = new Date();
  const closingTime = d.toLocaleString();

  Util.Log(
    'idlist:use',
    {
      openingTime,
      closingTime,
    },
    `${Util.getName(plyId)}(${plyId}) has used the idlist`,
    plyId
  );
});
