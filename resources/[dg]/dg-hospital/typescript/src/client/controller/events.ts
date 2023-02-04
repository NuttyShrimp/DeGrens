import { Events, Util } from '@dgx/client';
import {
  doNormalRevive,
  checkDeathOnDamage,
  setPlayerState,
  setPauseDownAnimation,
  loadDownStateOnRestart,
  setDownConfig,
} from 'modules/down/service.down';
import {
  loadBleedDamageTypes,
  processDamage,
  registerBleedHudIcon,
  removeBleedHudIcon,
  setBleedAmount,
  setHealth,
} from 'modules/health/service.health';
import { buildJobConfig } from 'modules/job/service.job';
import { cleanNeedsThread, startNeedsThread } from 'modules/needs/service.needs';

Events.onNet('hospital:client:init', (config: Hospital.Config) => {
  setDownConfig(config.health.respawnTime, config.damagetypes);
  loadDownStateOnRestart();
  buildJobConfig(config.job);
  registerBleedHudIcon();
  loadBleedDamageTypes(config.damagetypes);
});

Events.onNet('hospital:client:kill', (unconscious: boolean) => {
  setHealth(0, unconscious);
});

Events.onNet('hospital:client:revive', async () => {
  await doNormalRevive();
  setHealth(100);
  ClearPedBloodDamage(PlayerPedId());
  setBleedAmount(0);
  setPauseDownAnimation(false);
});

Util.onPlayerLoaded(playerData => {
  setPlayerState(playerData.metadata.downState, false);
  startNeedsThread();
});

Util.onPlayerUnloaded(() => {
  setPlayerState('alive', false);
  setBleedAmount(0);
  cleanNeedsThread();
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  setPlayerState('alive', false);
  removeBleedHudIcon();
});

on('entityDamaged', (victim: number, originPed: number, weaponHash: number) => {
  const ped = PlayerPedId();
  if (ped !== victim) return;

  weaponHash = weaponHash >>> 0;
  checkDeathOnDamage(originPed, weaponHash);
  processDamage(weaponHash);
});
