import { Events } from '@dgx/client';

Events.onNet('admin:util:setPedCoordsKeepVehicle', (coords: Vec3) => {
  const ped = PlayerPedId();
  SetPedCoordsKeepVehicle(ped, coords.x, coords.y, coords.z);
});
