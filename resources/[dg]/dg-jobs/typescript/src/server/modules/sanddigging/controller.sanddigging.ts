import { Events, Jobs, Notifications, Vehicles, Util } from '@dgx/server';
import { changeJob, getGroupByServerId } from 'modules/groups/service';
import {
  assignSpotToGroup,
  finishJob,
  getSanddiggingConfig,
  playerLeftGroup,
  receiveSpotLoot,
  registerVehicleToGroup,
  syncSanddiggingJobToClient,
} from './service.sanddigging';

Events.onNet('jobs:sanddigging:signIn', async (src: number) => {
  if (getGroupByServerId(src) === undefined) {
    Notifications.add(src, 'Je zit niet in een groep', 'error');
    return;
  }

  const vehicleLocation = getSanddiggingConfig().vehicle;
  if (Util.isAnyVehicleInRange(vehicleLocation, 3)) {
    Notifications.add(src, 'Er staat een voertuig in de weg', 'error');
    return;
  }

  const success = changeJob(src, 'sanddigging');
  if (!success) return;

  const vehicle = await Vehicles.spawnVehicle('caddy3', vehicleLocation, src);
  if (!vehicle) {
    Notifications.add(src, 'Kon het voertuig niet uithalen', 'error');
    return;
  }
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Vehicles.giveKeysToPlayer(src, netId);
  Vehicles.setFuelLevel(vehicle, 100);

  const group = getGroupByServerId(src)!;
  registerVehicleToGroup(group.id, netId);
  group.members.forEach(member => {
    if (member.serverId === null) return;
    Events.emitNet('jobs:sanddigging:start', member.serverId, netId);
  });
});

Jobs.onGroupJoin((plyId, _, groupId) => {
  syncSanddiggingJobToClient(groupId, plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  playerLeftGroup(groupId, plyId);
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

Events.onNet('jobs:sanddigging:checkActive', (src: number) => {
  const group = getGroupByServerId(src);
  if (!group) return;
  syncSanddiggingJobToClient(group.id, src);
});
