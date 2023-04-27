import { Events, PolyZone } from '@dgx/client';
import blackoutManager from 'classes/BlackoutManager';

PolyZone.onEnter<{ id: string }>('blackout_powerstation', (_, { id }) => {
  Events.emitNet('blackout:server:setAtLocation', 'powerstation', id, true);
});
PolyZone.onLeave<{ id: string }>('blackout_powerstation', (_, { id }) => {
  Events.emitNet('blackout:server:setAtLocation', 'powerstation', id, false);
});

PolyZone.onEnter<{ id: string }>('blackout_safezone', (_, { id }) => {
  Events.emitNet('blackout:server:setAtLocation', 'safezone', id, true);
  blackoutManager.setInSafeZone(true);
});
PolyZone.onLeave<{ id: string }>('blackout_safezone', (_, { id }) => {
  Events.emitNet('blackout:server:setAtLocation', 'safezone', id, false);
  blackoutManager.setInSafeZone(false);
});
