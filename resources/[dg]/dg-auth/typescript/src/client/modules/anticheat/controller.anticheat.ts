import { Events, RPC } from '@dgx/client';
import { Util } from '@dgx/shared';
import {
  allowCheck,
  cleanup,
  disallowCheck,
  getWeaponInfo,
  scheduleHeartBeat,
  scheduleWeaponThread,
  startThreads,
  stopHeartBeat,
} from './service.anticheat';

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
