import { Events, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface KickFromVehicleData {
  Target: UI.Player;
}

export const kickFromVehicle: CommandData = {
  name: 'kickFromVehicle',
  role: 'staff',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'kicked a player from a vehicle',
  handler: (caller, args: KickFromVehicleData) => {
    const ply = args?.Target?.serverId ?? caller.source;
    const ped = GetPlayerPed(String(ply));
    if (!GetVehiclePedIsIn(ped, false)) {
      Notifications.add(caller.source, 'Speler zit niet in een voertuig', 'error');
      return;
    }

    Events.emitNet('admin:commands:kickFromVehicle', ply);
  },
  UI: {
    title: 'Kick From Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
