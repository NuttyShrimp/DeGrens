import { Keys } from '@dgx/client';
import { WHITELISTED_HELIS } from './constants.heli';
import { changeVision, isHeliCamOn, isInPoliceHeli, setHeliCamOn, setInPoliceHeli } from './service.heli';
import { isCuffed } from 'modules/interactions/modules/cuffs';

// Only register as in popo heli when engine on and in passenger seat
on('baseevents:engineStateChanged', (vehicle: number, engineState: boolean) => {
  if (!engineState) {
    setInPoliceHeli(false);
    return;
  }

  if (isInPoliceHeli()) return;
  const model = GetEntityModel(vehicle);
  if (!WHITELISTED_HELIS.includes(model)) return;

  const ped = PlayerPedId();
  if (GetPedInVehicleSeat(vehicle, 0) !== ped) return;

  setInPoliceHeli(true);
});

on('baseevents:vehicleChangedSeat', (vehicle: number, newSeat: number, oldSeat: number) => {
  if (oldSeat === 0 && isInPoliceHeli()) {
    setInPoliceHeli(false);
  }
  if (newSeat === 0 && !isInPoliceHeli() && GetIsVehicleEngineRunning(vehicle)) {
    setInPoliceHeli(true);
  }
});

Keys.register('heli_cam', '(police) Toggle heli cam', 'E');
Keys.onPressDown('heli_cam', () => {
  if (!isInPoliceHeli()) return;
  const currentlyOn = isHeliCamOn();
  if (!currentlyOn && isCuffed()) return;
  setHeliCamOn(!currentlyOn);
});

Keys.register('heli_cam_filter', '(police) Heli cam filter', 'SPACE');
Keys.onPressDown('heli_cam_filter', () => {
  if (!isInPoliceHeli()) return;
  if (!isHeliCamOn()) return;
  PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
  changeVision();
});
