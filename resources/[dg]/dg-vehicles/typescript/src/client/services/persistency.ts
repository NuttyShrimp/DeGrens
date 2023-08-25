import { Events, Sync } from '@dgx/client';

// Thread sets entity as missionentity every 2 seconds.
// When entity doesnt exist anymore for client, or ownership is lost, thread is cleared and transfer event is emitted to server.
Sync.registerActionHandler('vehicles:persistency:startMissionEntityThread', (vehicle, data: unknown) => {
  const plyId = PlayerId();
  SetEntityAsMissionEntity(vehicle, true, true);

  const thread = setInterval(() => {
    if (!DoesEntityExist(vehicle) || NetworkGetEntityOwner(vehicle) !== plyId) {
      Events.emitNet('vehicles:persistency:transferMissionEntityThread', data);
      clearInterval(thread);
      return;
    }

    SetEntityAsMissionEntity(vehicle, true, true);
  }, 2000);
});
