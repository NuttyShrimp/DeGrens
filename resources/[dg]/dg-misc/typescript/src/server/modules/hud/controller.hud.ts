import { Events, Util } from '@dgx/server';
import { changeStress, loadStress } from './service.hud';

Events.onNet('hud:server:changeStress', (plyId, amount: number) => {
  changeStress(plyId, amount);
});

global.exports('changeStress', (plyId: number, amount: number) => {
  changeStress(plyId, amount);
});

Util.onPlayerLoaded(playerData => {
  loadStress(playerData.source, playerData.metadata?.stress ?? 0);
});
