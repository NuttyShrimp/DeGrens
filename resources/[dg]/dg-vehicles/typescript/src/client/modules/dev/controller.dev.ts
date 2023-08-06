import { Util } from '@dgx/client';
import { createCurrentSpotBox, removeCurrentSpotBox } from './service.dev';

setImmediate(() => {
  if (Util.isDevEnv()) {
    onNet('vehicles:dev:currentSpot', (spot: Vehicles.Garages.ParkingSpot) => {
      if (spot) {
        createCurrentSpotBox(spot);
        return;
      }
      removeCurrentSpotBox();
    });
  }
});
