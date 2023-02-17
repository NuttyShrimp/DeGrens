import { BaseEvents, Events, HUD } from '@dgx/client';
import {
  doSpeedStress,
  doWeaponStress,
  getCapacity,
  getStressLevel,
  handleStressChange,
  scheduleBlurEffect,
  setConfig,
  setIsDiving,
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

onNet('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  HUD.removeEntry('stress');
  HUD.removeEntry('lung-capacity');
});

BaseEvents.onStartDiving(() => {
  setIsDiving(true);
});

BaseEvents.onStopDiving(() => {
  setIsDiving(false);
});

AddStateBagChangeHandler(
  'stressAmount',
  `player:${GetPlayerServerId(PlayerId())}`,
  (_: string, key: string, val: number) => {
    if (key !== 'stressAmount') return;
    handleStressChange(val);
  }
);
