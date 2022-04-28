import { setPlyLoc } from '../helpers/location';
import { Events } from '@dgx/server';

Events.onNet('financials:location:set', (src, locId: string) => {
  setPlyLoc(source, locId);
});
