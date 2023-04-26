import { Util } from '@dgx/client';
import { HORN_JINGLE_TIMING, HORN_HASH } from './constants.oxyrun';

export const doHornJingleForVehicle = async (vehicle: number) => {
  for (const delay of HORN_JINGLE_TIMING) {
    StartVehicleHorn(vehicle, 100, HORN_HASH, false);
    await Util.Delay(delay + 100);
  }
};
