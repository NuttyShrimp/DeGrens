import { RPC, Sync, Admin } from '@dgx/server';

RPC.register('misc:idlist:getData', (plyId: number) => {
  const scopeInfo = Sync.getPlayerScope(plyId);
  const isAdmin = Admin.hasPermission(plyId, 'support');
  const hiddenPlys = Admin.getHiddenPlys();

  return {
    scopeInfo,
    isAdmin,
    hiddenPlys,
  };
});
