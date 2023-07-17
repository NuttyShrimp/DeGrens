import { Events, RPC } from '@dgx/server';
import { finishLootingParkingMeter, startLootingParkingMeter } from './service.parkingmeters';

RPC.register('criminal:parkingmeters:start', startLootingParkingMeter);
Events.onNet('criminal:parkingmeters:finish', finishLootingParkingMeter);
