import { Events } from '@dgx/client';

export const setEngineState = (vehicleId: number, state: boolean, instantly = false) => {
  // If engine is broken and trying to start engine, disable anyway
  if (GetVehicleEngineHealth(vehicleId) <= 0) {
    state = false;
  }
  SetVehicleEngineOn(vehicleId, state, instantly, true);
  SetVehiclePetrolTankHealth(vehicleId, state ? 1000 : 0); // Disabled auto start
};

Events.onNet('vehicles:setEngineState', (pVehNetId: number, state: boolean, instantly?: boolean) => {
  const vehicle = NetworkGetEntityFromNetworkId(pVehNetId);
  if (!DoesEntityExist(vehicle)) return;
  setEngineState(vehicle, state, instantly);
});
