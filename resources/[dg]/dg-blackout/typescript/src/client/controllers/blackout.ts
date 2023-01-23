import { Events, PolyZone } from '@dgx/client';
import blackoutManager from 'classes/BlackoutManager';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() != resourceName) return;
  blackoutManager.state = false;
});

AddStateBagChangeHandler('blackout', 'global', (bagName: string, keyName: string, blackout: boolean) => {
  blackoutManager.state = blackout;
});

Events.onNet('blackout:client:flicker', blackoutManager.flicker);

Events.onNet('blackout:server:buildSafeZones', (safeZones: ZoneData[]) => {
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
