import { Events, HUD } from '@dgx/client';

import {
  doSpeedStress,
  doWeaponStress,
  getCapacity,
  getStressLevel,
  scheduleBlurEffect,
  setConfig,
  updateStress,
} from './service.hud';

Events.onNet('hud:client:initialize', (config: HUD.Config) => {
  setConfig(config);

  HUD.addEntry('lung-capacity', 'lungs', '#ABBEE2', (ped, id) => getCapacity(ped, id), 2, 600, false);
  HUD.addEntry('stress', 'head-side-brain', '', () => getStressLevel(), 1, 100, false);

  // Loops
  setInterval(() => {
    if (!LocalPlayer.state.isLoggedIn) return;
    doSpeedStress();
  }, 10000);
  setInterval(() => {
    if (!LocalPlayer.state.isLoggedIn) return;
    doWeaponStress();
  }, 500);
  scheduleBlurEffect();
});

onNet('DGCore:client:playerLoaded', (playerData: PlayerData) => {
  updateStress(playerData?.metadata?.stress ?? 0);
});

onNet('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  HUD.removeEntry('stress');
  HUD.removeEntry('lung-capacity');
});

Events.onNet('hud:client:updateStress', (amount: number) => updateStress(amount));
