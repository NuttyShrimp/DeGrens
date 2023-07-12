import { Events } from '@dgx/client';
import { registerParkingMeterPeekOptions } from './service.parkingmeters';

Events.onNet('criminal:parkingmeters:registerPeekOptions', registerParkingMeterPeekOptions);
