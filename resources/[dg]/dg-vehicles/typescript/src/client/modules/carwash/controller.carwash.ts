import { Events, Keys, Sync } from '@dgx/client';

import { useCarwash, useCleaningKit, useWax } from './service.carwash';
import { isInCarwash } from './zones.carwash';

Keys.onPressDown('GeneralUse', async () => {
  if (!isInCarwash()) return;
  useCarwash();
});

Events.onNet('vehicles:carwash:useKit', () => {
  useCleaningKit();
});

Events.onNet('vehicles:carwash:useWax', () => {
  useWax();
});

Sync.registerActionHandler('vehicles:carwash:clean', vehicle => {
  SetVehicleDirtLevel(vehicle, 0.0);
  WashDecalsFromVehicle(vehicle, 1.0);
});
