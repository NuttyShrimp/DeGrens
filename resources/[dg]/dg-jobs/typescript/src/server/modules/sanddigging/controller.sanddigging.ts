import { Events, Notifications, Vehicles, Util } from '@dgx/server';
import { changeJob, getGroupByServerId } from 'modules/groups/service';
import {
  assignSpotToGroup,
  finishJob,
  getSanddiggingConfig,
  receiveSpotLoot,
  registerVehicleToGroup,
} from './service.sanddigging';
import jobManager from 'classes/jobManager';

Events.onNet('jobs:sanddigging:signIn', async (src: number) => {
  const group = getGroupByServerId(src);
  if (group === undefined) {
    Notifications.add(src, 'Je zit niet in een groep', 'error');
    return;
  }

  const vehicleLocation = getSanddiggingConfig().vehicle;
  if (Util.isAnyVehicleInRange(vehicleLocation, 3)) {
    Notifications.add(src, 'Er staat een voertuig in de weg', 'error');
    return;
  }

  const jobAssigned = changeJob(src, 'sanddigging');
  const payoutLevel = jobManager.getJobPayoutLevel('sanddigging');
  if (!jobAssigned || !payoutLevel) return;

  const vehicle = await Vehicles.spawnVehicle('caddy3', vehicleLocation, src);
  if (!vehicle) {
    Notifications.add(src, 'Kon het voertuig niet uithalen', 'error');
    return;
  }
  const vin = Vehicles.getVinForVeh(vehicle);
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  if (!vin || !netId) {
    Notifications.add(src, 'Kon het voertuig niet registreren', 'error');
    return;
  }

  Vehicles.giveKeysToPlayer(src, netId);
  Vehicles.setFuelLevel(vehicle, 100);

  Util.Log(
    'jobs:sanddigging:start',
    {
      groupId: group.id,
    },
    `${Util.getName(src)}(${src}) started sanddigging job for group`,
    src
  );

  registerVehicleToGroup(group.id, vin, payoutLevel);
  group.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:sanddigging:start', member.serverId, netId);
  });
});

Events.onNet('jobs:sanddigging:assignNewSpot', (src: number) => {
  assignSpotToGroup(src);
});

Events.onNet('jobs:sanddigging:receive', (src: number, spotId: number) => {
  receiveSpotLoot(src, spotId);
});

Events.onNet('jobs:sanddigging:finish', (src: number, netId: number) => {
  finishJob(src, netId);
});
