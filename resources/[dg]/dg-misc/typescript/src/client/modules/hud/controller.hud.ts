import { Events, HUD } from '@dgx/client';

import {
  doSpeedStress,
  doWeaponStress,
  getCapacity,
  loadConfig,
  scheduleBlurEffect,
  stressLevel,
  updateStress,
} from './service.hud';

setImmediate(async () => {
  await loadConfig();
  HUD.addEntry('lung-capacity', 'lungs', '#ABBEE2', (ped, id) => getCapacity(ped, id), 2, 600, false);
  HUD.addEntry('stress', 'head-side-brain', '', () => stressLevel, 1, 100, false);

  // Loops
  setInterval(() => {
    if (!LocalPlayer.state.loggedIn) return;
    doSpeedStress();
  }, 10000);
  setInterval(() => {
    if (!LocalPlayer.state.loggedIn) return;
    doWeaponStress();
  }, 500);
  scheduleBlurEffect();
});

onNet('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  HUD.toggleEntry('stress', false);
  HUD.toggleEntry('lung-capacity', false);
});

Events.onNet('hud:client:updateStress', (amount: number) => updateStress(amount));