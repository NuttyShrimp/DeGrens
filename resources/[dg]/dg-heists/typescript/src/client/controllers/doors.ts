import { getCurrentLocation } from './locations';
import { Events, RPC, Util } from '@dgx/client';

// TODO: smooth opening
export const setDoorState = async (heistId: Heist.Id, open: boolean) => {
  await Util.Delay(500);
  const door = await RPC.execute<Heist.Door>('heists:server:getDoorData', heistId);
  if (!door) return;
  if (door.portalId) {
    loadVaultRoom(door);
    await Util.Delay(250);
  }
  const obj = GetClosestObjectOfType(
    door.coords.x,
    door.coords.y,
    door.coords.z,
    10.0,
    door.model,
    false,
    false,
    false
  );
  const heading = open ? door.heading.open : door.heading.closed;
  SetEntityHeading(obj, heading);
  FreezeEntityPosition(obj, true);
};

const loadVaultRoom = (data: Heist.Door) => {
  const interior = GetInteriorFromEntity(PlayerPedId());
  if (interior == 0) return;
  SetInteriorPortalFlag(interior, data.portalId, 0);
  RefreshInterior(interior);
};

Events.onNet('heists:client:setDoorState', (heistId: Heist.Id, state: boolean) => {
  const currentLocation = getCurrentLocation();
  if (!currentLocation || currentLocation != heistId) return;
  setDoorState(heistId, state);
});
