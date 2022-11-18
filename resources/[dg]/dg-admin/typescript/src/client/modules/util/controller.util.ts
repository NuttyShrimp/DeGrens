import { Events, Util } from '@dgx/client';

Events.onNet('admin:util:setPedCoordsKeepVehicle', async (coords: Vec3) => {
  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!ped) return;
  const oldCoords = Util.getPlyCoords();
  SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(coords));
  FreezeEntityPosition(vehicle ?? ped, true);
  let found, groundZ;
  for (let zCoord = 825; zCoord > 0; zCoord -= 25) {
    NewLoadSceneStart(coords.x, coords.y, zCoord, coords.x, coords.y, zCoord, 50, 0);
    await Util.awaitCondition(() => IsNetworkLoadingScene(), 1000);
    NewLoadSceneStop();
    coords.z = zCoord;
    SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(coords));

    RequestCollisionAtCoord(...Util.Vector3ToArray(coords));
    await Util.awaitCondition(() => HasCollisionLoadedAroundEntity(ped), 1000);

    [found, groundZ] = GetGroundZFor_3dCoord(coords.x, coords.y, coords.z, false);
    if (found) {
      SetPedCoordsKeepVehicle(ped, coords.x, coords.y, groundZ);
      break;
    }
  }
  FreezeEntityPosition(vehicle ?? ped, false);
  if (!found) {
    console.log(`Could not find ground for ${coords.x}, ${coords.y}, ${coords.z}`);
    SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(oldCoords));
  }
});
