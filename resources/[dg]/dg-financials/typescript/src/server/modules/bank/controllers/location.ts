import { setPlyLoc } from '../helpers/location';

onNet('financials:location:set', (locId: string) => {
	setPlyLoc(source, locId);
});
