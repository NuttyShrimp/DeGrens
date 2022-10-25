import { Events, Keys } from '@dgx/client';

import { cleanDecals, useCarwash, useCleaningKit, useWax } from './service.carwash';
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

Events.onNet('vehicles:carwash:cleanDecals', (netId: number) => {
  cleanDecals(netId);
});
