import { Core, Events, Util } from '@dgx/server';
import { changeStress, loadStress } from './service.hud';

Events.onNet('hud:server:changeStress', (plyId, amount: number) => {
  changeStress(plyId, amount);
});

global.exports('changeStress', (plyId: number, amount: number) => {
  changeStress(plyId, amount);
});

Core.onPlayerLoaded(playerData => {
  if (!playerData.serverId) return;
  loadStress(playerData.serverId, playerData.metadata?.stress ?? 0);
});
