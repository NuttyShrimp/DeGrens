import { Events, Notifications } from '@dgx/client';

export const setEngineState = (vehicle: number, state: boolean, instantly = false) => {
  // when trying to start engine check if its possible
  if (state && (GetVehicleEngineHealth(vehicle) <= 0 || Entity(vehicle).state.undriveable)) {
    state = false;
    Notifications.add('Er is iets kapot...', 'error');
  }

  SetVehicleEngineOn(vehicle, state, instantly, true);
};

Events.onNet('vehicles:setEngineState', (pVehNetId: number, state: boolean, instantly?: boolean) => {
  const vehicle = NetworkGetEntityFromNetworkId(pVehNetId);
  if (!DoesEntityExist(vehicle)) return;
  setEngineState(vehicle, state, instantly);
});
