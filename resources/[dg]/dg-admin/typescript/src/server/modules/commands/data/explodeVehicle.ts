import { Sync, Util } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';
import { Inputs } from '../../../enums/inputs';

interface ExplodeVehicleData {
  Target?: UI.Player;
  entity?: number;
}

export const explodeVehicle: CommandData = {
  name: 'explodeVehicle',
  role: 'developer',
  log: 'exploded a vehicle',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  handler: (caller, args?: ExplodeVehicleData) => {
    const plyId = args?.Target?.serverId ?? caller.source;

    let vehicle = args?.entity;
    if (!vehicle) {
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
    }

    Sync.executeNative('NetworkExplodeVehicle', vehicle, true, false, false);
  },
  UI: {
    title: 'Explode Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
