import { Keys } from '@dgx/client';

import { isSirensAllowed, pushStateChange, updateStateBag } from '../helpers/util';

let restoreSiren = 0;

Keys.onPressDown('siren_sound_cycle', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  const sirenState: Sirens.State = Entity(veh).state.sirenState;

  if (!sirenState.lights) return;

  let newSirenMode = (sirenState.sirenMode || 0) + 1;

  if (newSirenMode > 3) {
    newSirenMode = 1;
  }

  PlaySoundFrontend(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true);

  updateStateBag(veh, 'siren', true, sirenState);
  updateStateBag(veh, 'sirenMode', newSirenMode, sirenState);
  pushStateChange(veh);
});

Keys.register('siren_sound_cycle', 'Cycle through vehicle siren sounds (when lights are on)', 'COMMA');

Keys.onPressDown('siren_sound_2_cycle', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  PlaySoundFrontend(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true);

  updateStateBag(veh, 'siren2', true);
  updateStateBag(veh, 'siren2Mode', 1);
  pushStateChange(veh);
});

Keys.register('siren_sound_2_cycle', 'Cycle through secondary siren sounds', 'UP');

Keys.onPressDown('siren_lights_toggle', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  const sirenState: Sirens.State = Entity(veh).state.sirenState;
  PlaySoundFrontend(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true);
  const curMode = sirenState.lights;
  updateStateBag(veh, 'lights', !curMode, sirenState);

  if (!curMode) {
    pushStateChange(veh);
    return;
  }

  updateStateBag(veh, 'siren2', false, sirenState);
  updateStateBag(veh, 'siren', false, sirenState);
  updateStateBag(veh, 'sirenMode', 0, sirenState);
  pushStateChange(veh);
});

Keys.register('siren_lights_toggle', 'Toggle vehicles siren lights', 'Q');

Keys.onPressDown('siren_sound_off', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  updateStateBag(veh, 'siren', false);
  updateStateBag(veh, 'siren2', false);
  updateStateBag(veh, 'sirenMode', 0);
  updateStateBag(veh, 'siren2Mode', 0);
  pushStateChange(veh);
});

Keys.register('siren_sound_off', 'Turn off all sirens', 'PERIOD');

Keys.onPressDown('sirens_mode_hold', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  const sirenState: Sirens.State = Entity(veh).state.sirenState;

  if ((sirenState.siren || sirenState.siren2) && sirenState.lights) return;

  updateStateBag(veh, 'sirenMode', 1, sirenState);
  pushStateChange(veh);
});

Keys.onPressUp('sirens_mode_hold', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  updateStateBag(veh, 'sirenMode', 0);
  pushStateChange(veh);
});

Keys.register('sirens_mode_hold', 'Hold to sound vehicle siren', 'R');

Keys.onPressDown('horn_hold', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  const sirenState: Sirens.State = Entity(veh).state.sirenState;

  if (sirenState.horn) return;

  updateStateBag(veh, 'horn', true, sirenState);
  restoreSiren = sirenState.sirenMode;
  updateStateBag(veh, 'sirenMode', 0, sirenState);
  pushStateChange(veh);
});

Keys.onPressUp('horn_hold', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!isSirensAllowed(veh, ped)) return;

  const sirenState: Sirens.State = Entity(veh).state.sirenState;

  if (!sirenState.horn) return;

  updateStateBag(veh, 'horn', false, sirenState);
  updateStateBag(veh, 'sirenMode', sirenState.lights ? restoreSiren : 0, sirenState);
  restoreSiren = 0;
  pushStateChange(veh);
});

Keys.register('horn_hold', 'Hold to sound the vehicles horn (sirens)', 'E');
