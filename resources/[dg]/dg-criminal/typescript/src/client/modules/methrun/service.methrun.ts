import { PolyZone } from '@dgx/client';

let vehicleZoneBuilt = false;

export const buildMethRunVehicleZone = (points: Vec2[]) => {
  if (vehicleZoneBuilt) return;

  PolyZone.addPolyZone('methrun_vehicle', points, {
    data: {},
    routingBucket: 0,
  });
  vehicleZoneBuilt = true;
};

export const destroyMethRunVehicleZone = () => {
  if (!vehicleZoneBuilt) return;

  PolyZone.removeZone('methrun_vehicle');
  vehicleZoneBuilt = false;
};
