import { Events, Peek } from '@dgx/client';

Peek.addFlagEntry('heistsDoorReset', {
  options: [
    {
      label: 'Bank Vergrendelen',
      icon: 'fas fa-arrows-rotate',
      job: 'police',
      action: (_, entity) => {
        if (!entity) return;
        const locationId = Entity(entity).state.locationId as Heists.LocationId;
        if (!locationId) return;
        Events.emitNet('heists:location:resetDoor', locationId);
      },
    },
  ],
  distance: 2,
});
