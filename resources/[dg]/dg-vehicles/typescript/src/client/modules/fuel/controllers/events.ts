import { Statebags } from '@dgx/client';
import { setFuelLevel } from '../service.fuel';

Statebags.addCurrentVehicleStatebagChangeHandler<number>('fuelLevel', (_, value) => {
  setFuelLevel(value);
});
