import { BlipManager, Core, Events, Util } from '@dgx/client';
import {
  doNormalRevive,
  checkDeathOnDamage,
  setPlayerState,
  loadDownStateOnRestart,
  setDownConfig,
  loadPedFlags,
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
});

Core.onPlayerLoaded(playerData => {
  setPlayerState(playerData.metadata.downState, false);
  startNeedsThread();
  loadPedFlags();
});

Core.onPlayerUnloaded(() => {
  setPlayerState('alive', false);
  setBleedAmount(0);
  cleanNeedsThread();
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  setPlayerState('alive', false);
  removeBleedHudIcon();
  BlipManager.removeCategory('hospital');
});

on('entityDamaged', (victim: number, originPed: number, weaponHash: number) => {
  const ped = PlayerPedId();
  if (ped !== victim) return;

  weaponHash = weaponHash >>> 0;
  checkDeathOnDamage(originPed, weaponHash);
  processDamage(weaponHash);
});
