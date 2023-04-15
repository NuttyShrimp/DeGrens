import { BaseEvents, Events, Keys, Peek, Util } from '@dgx/client';
import { ATMS } from '../../../shared/atm/constants.atm';
import {
  canDoAtmRobbery,
  clearActiveRobberyVehicleDriverThread,
  destroyAllRopes,
  finishAttaching,
  isCurrentlyAttaching,
  pickupAtm,
  registerActiveRobbery,
  setWhitelistedAtmRobberyVehicleModels,
  startActiveRobberyVehicleDriverThread,
  startAttaching,
  stopAttaching,
  unregisterActiveRobbery,
} from './service.atm';
import { getBackCoordsOfEntity } from './helpers.atm';

Events.onNet('criminal:atm:init', (activeRobberies: Criminal.ATM.Robbery[], vehicleModels: string[]) => {
  setWhitelistedAtmRobberyVehicleModels(vehicleModels);
  activeRobberies.forEach(registerActiveRobbery);
});

Events.onNet('criminal:atm:registerRobbery', registerActiveRobbery);
Events.onNet('criminal:atm:unregisterRobbery', unregisterActiveRobbery);

Peek.addModelEntry(
  ATMS.map(a => a.model),
  {
    options: [
      {
        label: 'Touw vastmaken',
        icon: 'fas fa-link',
        items: ['atm_rope', 'big_drill'],
        action: (_, atm) => {
          if (!atm) return;
          startAttaching(atm);
        },
        canInteract: atm => canDoAtmRobbery({ atm }) && !isCurrentlyAttaching(),
      },
    ],
  }
);

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Touw vastmaken',
      icon: 'fas fa-link',
      action: (_, vehicle) => {
        if (!vehicle) return;
        finishAttaching(vehicle);
      },
      canInteract: vehicle =>
        !!vehicle &&
        canDoAtmRobbery({ vehicle }) &&
        isCurrentlyAttaching() &&
        Util.getPlyCoords().distance(getBackCoordsOfEntity(vehicle)) < 1.5,
    },
  ],
});

Keys.onPressDown('cancelEmote', () => {
  if (!isCurrentlyAttaching()) return;
  stopAttaching();
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  destroyAllRopes();
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  if (seat !== -1) return;
  startActiveRobberyVehicleDriverThread(vehicle);
});

BaseEvents.onLeftVehicle(() => {
  clearActiveRobberyVehicleDriverThread();
});

BaseEvents.onVehicleSeatChange((vehicle, newSeat) => {
  if (newSeat === -1) {
    startActiveRobberyVehicleDriverThread(vehicle);
  } else {
    clearActiveRobberyVehicleDriverThread();
  }
});

Peek.addFlagEntry('isRobberyAtm', {
  options: [
    {
      label: 'Opnemen',
      icon: 'fas fa-hand-holding',
      action: (_, atmEntity) => {
        if (!atmEntity) return;
        pickupAtm(atmEntity);
      },
    },
  ],
  distance: 2,
});
