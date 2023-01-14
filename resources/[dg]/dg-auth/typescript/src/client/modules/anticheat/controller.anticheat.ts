import { Events, Hospital, RPC } from '@dgx/client';
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

// Headbones
const HEAD_BONES = new Set([31085, 31086, 39317]);

// Damage param is always 0
on('entityDamaged', (victim: number, attacker: number, weapon: number) => {
  const ped = PlayerPedId();
  if (Number(victim) !== ped) return;
  if (!IsPedInjured(ped)) return;

  if (!IsEntityAPed(attacker) || !IsPedAPlayer(attacker)) return;
  const attackerPly = Util.getServerIdForPed(Number(attacker));
  if (!attackerPly) return;

  const [______, boneHit] = GetPedLastDamageBone(ped);
  Events.emitNet('auth:anticheat:stats:killConfirm', {
    attacker: attackerPly,
    weaponHash: Number(weapon),
    headshot: HEAD_BONES.has(boneHit),
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
