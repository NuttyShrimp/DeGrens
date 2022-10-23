import gangManager from 'classes/gangmanager';

global.asyncExports('getGangByName', async (name: string) => {
  const gang = gangManager.getGang(name, true);
  if (!gang) return;
  return gang.getClientVersion();
});

global.asyncExports('getPlayerGang', async (cid: number) => {
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return;
  return gang.getClientVersion();
});
