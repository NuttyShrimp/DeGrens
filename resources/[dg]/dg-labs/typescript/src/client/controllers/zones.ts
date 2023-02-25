import { Events, PolyZone } from '@dgx/client';

PolyZone.onEnter<{ id: number }>('lab', (_, { id }) => {
  Events.emitNet('labs:server:entered', id);
});

PolyZone.onLeave<{ id: number }>('lab', (_, { id }) => {
  Events.emitNet('labs:server:left', id);
});

PolyZone.onEnter<{ id: number }>('lab_entrance', (_, { id }) => {
  Events.emitNet('labs:server:logDoor', id);
});
