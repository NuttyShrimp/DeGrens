import { Events } from '@dgx/server';
import { updateStress } from './service.hud';

Events.onNet('hud:server:GainStress', (src, amount: number) => {
  updateStress(src, amount);
});

Events.onNet('hud:server:RelieveStress', (src, amount: number) => {
  updateStress(src, -amount);
});

global.exports('changeStress', (plyId: number, amount: number) => {
  updateStress(plyId, amount);
});
