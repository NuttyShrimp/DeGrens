import { BaseEvents } from '@dgx/server';

BaseEvents.onEnteredVehicle((src, vehNetId) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!DoesEntityExist(veh)) return;
  const sirenState = Entity(veh).state.sirenState;
  if (sirenState) return;
  Entity(veh).state.set(
    'sirenState',
    {
      sirenMode: 0,
      siren2Mode: 0,
      horn: false,
      lights: false,
      siren: false,
      siren2: false,
    },
    true
  );
});
