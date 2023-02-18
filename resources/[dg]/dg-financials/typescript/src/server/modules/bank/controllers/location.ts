import { Events } from '@dgx/server';

import { setPlyLoc } from '../helpers/location';

Events.onNet('financials:location:set', (src, locId: string | null) => {
  setPlyLoc(src, locId);
});
