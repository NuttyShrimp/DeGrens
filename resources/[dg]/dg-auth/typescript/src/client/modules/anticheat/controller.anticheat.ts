import { Events, RPC } from '@dgx/client';
import { Util } from '@dgx/client';
import {
  allowCheck,
  cleanup,
  disallowCheck,
  getWeaponInfo,
  scheduleHeartBeat,
  scheduleWeaponThread,
  startStatThread,
  startThreads,
  stopHeartBeat,
  stopStatsThread,
} from './service.anticheat';

on('entityDamaged', (victim: number, attacker: number, weapon: number, baseDamage: number) => {
  const attackerPly = Util.getServerIdForPed(Number(attacker));
  if (Number(victim) !== PlayerPedId() || !attackerPly) {
    return;
  }
  if (!IsPlayerDead(PlayerId())) return;
  const [______, boneHit] = GetPedLastDamageBone(Number(victim));
  Events.emitNet('auth:anticheat:stats:killConfirm', {
    attacker: attackerPly,
    victim: Util.getServerIdForPed(Number(victim)),
    weaponHash: Number(weapon),
    damage: baseDamage,
    headshot: boneHit === GetHashKey('SKEL_Head'),
  });
});

Events.onNet('auth:anticheat:weaponDrawn', () => {
  startStatThread();
});

Events.onNet('auth:anticheat:weaponRemoved', () => {
  stopStatsThread();
});

Events.onNet('auth:anticheat:forceSyncWeaponInfo', () => {
  scheduleWeaponThread();
});

RPC.register('auth:anticheat:toggleACAllowed', (check: string, isAllowed: boolean) => {
  isAllowed ? allowCheck(check) : disallowCheck(check);
});

RPC.register('auth:anticheat:confirmWeaponInfo', (srvInfo: AntiCheat.WeaponInfo) => {
  const clInfo = getWeaponInfo();
  return clInfo.weapon === srvInfo.weapon && clInfo.ammo === srvInfo.ammo;
});

setImmediate(async () => {
  while (!NetworkIsSessionActive()) {
    await new Promise(res => setTimeout(res, 10));
  }
  await Util.Delay(2000);
  scheduleHeartBeat();
  startThreads();
});

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  stopHeartBeat();
  cleanup();
});
