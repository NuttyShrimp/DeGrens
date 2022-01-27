import './modules/bank';
import './modules/cash';
import { LocationManager } from './classes/LocationManager';
import { registerPeekZones, unregisterPeekZones } from './modules/bank/service';

setImmediate(() => {
	LocationManager.getInstance().initLocation();
	registerPeekZones();
});

on('onResourceStop', (resource: string) => {
	if (resource === GetCurrentResourceName()) {
		unregisterPeekZones();
	}
});
