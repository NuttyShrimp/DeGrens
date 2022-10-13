import { Events, RPC } from '@dgx/server';
import { getConfig } from 'services/config';
import { getWeaponAmmo, setWeaponAmmo } from './service.ammo';

RPC.register('weapons:server:getAmmoConfig', src => {
  return getConfig().ammo;
});

RPC.register('weapons:server:getAmmo', (src, itemId: string) => {
  return getWeaponAmmo(itemId);
});

Events.onNet('weapons:server:setAmmo', (src: number, itemId: string, amount: number) => {
  setWeaponAmmo(itemId, amount);
});
