import blackoutManager from 'classes/BlackoutManager';
import { RPC, PolyZone } from '@dgx/client';
import { clientConfig as config } from '../../config';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() != resourceName) return;
  blackoutManager.state = false;
});

onNet('dg-blackout:client:SetBlackout', (value: boolean) => {
  blackoutManager.state = value;
});

onNet('dg-blackout:client:Flicker', blackoutManager.flicker);

setImmediate(async () => {
  blackoutManager.state = await RPC.execute<boolean>('dg-blackout:server:GetBlackoutState');

  config.safezones.forEach(zone => {
    PolyZone.addPolyZone('blackout_safezone', zone.vectors, zone.options, true);
  });
});

PolyZone.onEnter('blackout_safezone', () => {
  blackoutManager.inSafezone = true;
});
PolyZone.onLeave('blackout_safezone', () => {
  blackoutManager.inSafezone = false;
});
