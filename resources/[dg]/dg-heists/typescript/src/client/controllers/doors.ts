import { getCurrentLocation } from './locations';
import heistData from '../config/heistdata';
import { Events, Util } from '@dgx/client';

// TODO: smooth opening
export const setDoorState = async (heistId: Heist.Id, open: boolean) => {
  await Util.Delay(500);
  if (!('door' in heistData[heistId])) return;
  const data = heistData[heistId].door;
  if (data.portalId) {
    loadVaultRoom(data);
    await Util.Delay(250);
  }
  const obj = GetClosestObjectOfType(
    data.coords.x,
    data.coords.y,
    data.coords.z,
    10.0,
    data.model,
    false,
    false,
    false
  );
  const heading = open ? data.heading.open : data.heading.closed;
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
