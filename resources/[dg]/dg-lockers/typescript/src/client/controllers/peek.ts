import { Events, Peek } from '@dgx/client';

Peek.addZoneEntry('locker', {
  options: [
    {
      label: 'Locker Bekijken',
      icon: 'warehouse',
      action: option => {
        Events.emitNet('lockers:server:view', option.data.id);
      },
    },
  ],
  distance: 2.0,
});
