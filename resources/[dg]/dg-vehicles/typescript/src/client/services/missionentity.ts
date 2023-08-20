import { Events, Sync } from '@dgx/client';

Sync.registerActionHandler('vehicles:missionentity:startThread', (vehicle, data: unknown) => {
  const plyId = PlayerId();
  const thread = setInterval(() => {
    if (!DoesEntityExist(vehicle) || NetworkGetEntityOwner(vehicle) !== plyId) {
      Events.emitNet('vehicles:missionentity:transfer', data);
      clearInterval(thread);
      return;
    }

    SetEntityAsMissionEntity(vehicle, true, true);
  }, 2000);
});
