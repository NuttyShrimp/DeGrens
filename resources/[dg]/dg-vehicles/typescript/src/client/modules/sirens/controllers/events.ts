import { BaseEvents } from '@dgx/client';

import { cleanupKeyThread, createKeyThread } from '../helpers/threads';
import { isSirensAllowed } from '../helpers/util';

BaseEvents.onEnteredVehicle(veh => {
  const ped = PlayerPedId();
  const allowedSirens = isSirensAllowed(veh, ped);
  if (!allowedSirens) return;

  SetVehRadioStation(veh, 'OFF');
  SetVehicleRadioEnabled(veh, false);
  createKeyThread();
});

BaseEvents.onLeftVehicle((veh, seat) => {
  cleanupKeyThread();
  if (seat !== -1) return;
  const sirenState: Sirens.State = Entity(veh).state.sirenState;
  sirenState.sirenMode = 0;
  sirenState.siren2Mode = 0;
  sirenState.siren = false;
  sirenState.siren2 = false;
  sirenState.horn = false;

  Entity(veh).state.set('sirenState', sirenState, true);
});
