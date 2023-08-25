import { Events, PolyZone } from '@dgx/client';

PolyZone.onEnter('ctm_capture_zone', (zone: string, data: { id: string }) => {
  Events.emitNet('events:ctm:capture_zone', data.id);
});

PolyZone.onLeave('ctm_capture_zone', (zone: string, data: { id: string }) => {
  Events.emitNet('events:ctm:leave_zone', data.id);
});
