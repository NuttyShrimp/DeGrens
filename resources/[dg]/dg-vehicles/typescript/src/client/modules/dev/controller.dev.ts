import { createCurrentSpotBox, removeCurrentSpotBox } from './service.dev';

let registeredEvent = false;

onNet('dgx:isProduction', (isProd: boolean) => {
  if (!isProd || registeredEvent) return;
  onNet('vehicles:dev:currentSpot', (spot: Vehicles.Garages.ParkingSpot) => {
    if (spot) {
      createCurrentSpotBox(spot);
      return;
    }
    removeCurrentSpotBox();
  });
});
