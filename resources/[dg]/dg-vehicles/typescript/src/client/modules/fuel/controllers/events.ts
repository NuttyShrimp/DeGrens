import { Events } from '@dgx/client';

import { setFuelLevel } from '../service.fuel';

Events.onNet('vehicles:fuel:set', (fuel: number) => {
  setFuelLevel(fuel);
});
