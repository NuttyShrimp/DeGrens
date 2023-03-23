import gangManager from 'classes/gangmanager';

global.asyncExports('getGangByName', async (name: string) => {
  const gang = gangManager.getGang(name, true);
  if (!gang) return;
  return gang.getClientVersion();
});

global.exports('getPlayerGangName', (cid: number) => {
  const gang = gangManager.getPlayerGang(cid);
  if (!gang) return;
  return gang.name;
});
