import { BlipManager, Core, Events, Peek, PolyZone, Sync, Util, Vehicles } from '@dgx/client';
import {
  buildLocationZone,
  cleanupOxyrun,
  finishBuyer,
  handleEnterLocation,
  handleLeaveLocation,
  isDoingOxyRun,
} from './service.oxyrun';
import { doHornJingleForVehicle } from './helpers.oxyrun';

Peek.addFlagEntry('oxyRunStart', {
  options: [
    {
      label: 'Aanmelden',
      icon: 'fas fa-pills',
      action: () => {
        Events.emitNet('criminal:oxyrun:start');
      },
      canInteract: () => !isDoingOxyRun(),
    },
    {
      label: 'Pakket nemen',
      icon: 'fas fa-prescription-bottle-pill',
      action: () => {
        Events.emitNet('criminal:oxyrun:takeBox');
      },
      canInteract: () => isDoingOxyRun(),
    },
  ],
});

Events.onNet('criminal:oxyrun:buildLocation', buildLocationZone);
Events.onNet('criminal:oxyrun:finishSale', finishBuyer);
Events.onNet('criminal:oxyrun:cleanup', cleanupOxyrun);

PolyZone.onEnter('oxyrun_location', handleEnterLocation);
PolyZone.onLeave('oxyrun_location', handleLeaveLocation);

Core.onPlayerUnloaded(() => {
  cleanupOxyrun();
});

Sync.registerActionHandler('oxyrun:doVehicleAction', async (vehicle: number) => {
  doHornJingleForVehicle(vehicle);
  SetVehicleUndriveable(vehicle, true);
  BringVehicleToHalt(vehicle, 3.0, 1000, false);
  Vehicles.setVehicleDoorsLocked(vehicle, false);
});

Sync.registerActionHandler('oxyrun:clearVehicle', async (vehicle: number) => {
  SetVehicleUndriveable(vehicle, false);
  StopBringVehicleToHalt(vehicle);
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  BlipManager.removeCategory('oxyrun');
});
