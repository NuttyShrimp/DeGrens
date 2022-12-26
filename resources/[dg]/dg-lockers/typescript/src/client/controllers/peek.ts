import { Events, Peek } from '@dgx/client/classes';

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
