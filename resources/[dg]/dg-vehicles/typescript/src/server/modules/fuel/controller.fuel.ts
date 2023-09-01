import { BaseEvents, Events } from '@dgx/server';
import { fuelManager } from './classes/fuelManager';
import { doRefuel, openRefuelMenu } from './service.fuel';

Events.onNet('vehicles:fuel:doRefuel', (src, netId: number, usingJerryCan: boolean) => {
  doRefuel(src, netId, usingJerryCan);
});

Events.onNet('vehicles:fuel:openRefuelMenu', (src, netId: number) => {
  openRefuelMenu(src, netId);
});

// Save fuel when player stops becoming driver
BaseEvents.onLeftVehicle((_, vehicle, seat) => {
  if (seat !== -1) return;
  fuelManager.saveFuel(vehicle);
});

BaseEvents.onVehicleSeatChange((_, vehicle, __, oldSeat) => {
  if (oldSeat !== -1) return;
  fuelManager.saveFuel(vehicle);
});
