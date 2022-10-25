import { isDevEnv } from '../../../shared/sh_util';

import { createCurrentSpotBox, removeCurrentSpotBox } from './service.dev';

if (isDevEnv()) {
  onNet('vehicles:dev:currentSpot', (spot: Garage.ParkingSpot) => {
    if (spot) {
      createCurrentSpotBox(spot);
      return;
    }
    removeCurrentSpotBox();
  });
}
