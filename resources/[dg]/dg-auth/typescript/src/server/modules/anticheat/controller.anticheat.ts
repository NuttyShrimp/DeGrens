import { Events } from '@dgx/server';
import {
  checkAllowedModules,
  cleanup,
  flagUser,
  loadConfig,
  registerExplosion,
  registerHeartBeat,
  setPlayerInvincible,
  setPlayerVisible,
  startThreads,
  stopHeartBeat,
  validateWeaponInfo,
} from './service.anticheat';

global.exports('SetPlayerInvincible', setPlayerInvincible);
global.exports('SetPlayerVisible', setPlayerVisible);

onNet('playerJoining', () => {
  registerHeartBeat(source);
});

onNet('playerDropped', () => {
  stopHeartBeat(source);
});

on('explosionEvent', (sender: string, ev: AntiCheat.ExplosionEventInfo) => {
  const shouldCancel = registerExplosion(+sender, ev);
  if (shouldCancel) CancelEvent();
});

Events.onNet('auth:heartbeat', (src: number) => {
  console.log('Received heartbeat', src);
});

Events.onNet('auth:anticheat:addFlag', (src: number, reason: string) => {
  flagUser(src, reason);
});

Events.onNet('auth:anticheat:weaponCheck', (src: number, weaponInfo: AntiCheat.WeaponInfo) => {
  validateWeaponInfo(src, weaponInfo);
});

Events.onNet('auth:anticheat:syncAllowedModules', (src: number, allowedMods: string[]) => {
  checkAllowedModules(src, allowedMods);
});

Events.onNet('auth:anticheat:native:setPlayerInvincible', (src: number, isEnabled: boolean) => {
  setPlayerInvincible(src, isEnabled);
});

Events.onNet('auth:anticheat:native:setPlayerVisible', (src: number, isVisible: boolean) => {
  setPlayerVisible(src, isVisible);
});

setImmediate(() => {
  startThreads();
  loadConfig();
});

on('onResourceStop', () => {
  cleanup();
});
