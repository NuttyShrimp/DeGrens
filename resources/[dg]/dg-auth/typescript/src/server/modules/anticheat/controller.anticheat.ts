import { Admin, Config, Events } from '@dgx/server';
import { isRecentlyRestarted } from 'helpers/resources';
import {
  checkAllowedModules,
  flagUser,
  loadConfig,
  queueHit,
  queueShot,
  registerExplosion,
  registerHeartBeat,
  setPlayerInvincible,
  setPlayerVisible,
  stopHeartBeat,
  toggleAllowedMod,
  validateWeaponInfo,
} from './service.anticheat';

global.asyncExports('setPlayerInvincible', setPlayerInvincible);
global.asyncExports('setPlayerVisible', setPlayerVisible);
global.asyncExports('toggleAllowedMod', toggleAllowedMod);

onNet('playerJoined', () => {
  registerHeartBeat(source, true);
});

onNet('playerDropped', () => {
  stopHeartBeat(source);
});

on('explosionEvent', (sender: string, ev: AntiCheat.ExplosionEventInfo) => {
  const shouldCancel = registerExplosion(+sender, ev);
  if (shouldCancel) CancelEvent();
});

Events.onNet('auth:heartbeat', (src: number) => {
  registerHeartBeat(src);
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

Events.onNet('auth:anticheat:stats:killConfirm', (src: number, killInfo: Omit<AntiCheat.EntityDamage, 'victim'>) => {
  queueHit({ victim: src, ...killInfo });
});

Events.onNet('auth:anticheat:stats:ammoInfo', (src: number, ammo: number[]) => {
  queueShot(src, ammo);
});

Events.onNet('auth:anticheat:resourceStart', (src: number, res: string) => {
  if (!isRecentlyRestarted(res)) {
    Admin.ACBan(src, '(re)started a unknown resource', {
      resource: res,
    });
  }
});

Events.onNet('auth:anticheat:AFK', (src: number) => {
  if (Admin.canPlayerBeAFK(src)) return;
  const afkKickMessage = Config.getConfigValue<AntiCheat.Config>('anticheat')?.afkKickMessage ?? '';
  Admin.kick(-1, src, [afkKickMessage], 0);
});

setImmediate(() => {
  loadConfig();
});
