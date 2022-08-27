import { Events, PolyZone, RPC } from '@dgx/client';
import blackoutManager from 'classes/BlackoutManager';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() != resourceName) return;
  blackoutManager.state = false;
});

Events.onNet('blackout:client:setBlackout', (value: boolean) => {
  blackoutManager.state = value;
});

Events.onNet('blackout:client:flicker', blackoutManager.flicker);

setImmediate(async () => {
  blackoutManager.state = await RPC.execute<boolean>('blackout:server:getBlackoutState');
  const safeZones = await RPC.execute<ZoneData[]>('blackout:server:getSafeZones');

  safeZones.forEach(zone => {
    PolyZone.addPolyZone('blackout_safezone', zone.vectors, zone.options, true);
  });
});

PolyZone.onEnter('blackout_safezone', () => {
  blackoutManager.inSafezone = true;
});
PolyZone.onLeave('blackout_safezone', () => {
  blackoutManager.inSafezone = false;
});
