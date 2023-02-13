import { Events, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface TeleportInVehicle {
  Target: UI.Player;
  entity: number;
}

export const teleportInVehicle: CommandData = {
  name: 'teleportInVehicle',
  role: 'staff',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'teleported in a vehicle',
  handler: (caller, args: TeleportInVehicle) => {
    let vehicle = args?.entity;
    if (!vehicle) {
      const plyId = args?.Target?.serverId;
      if (!plyId) {
        Notifications.add(caller.source, 'Je moet een target ingeven', 'error');
      }
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
      if (!vehicle) {
        Notifications.add(caller.source, 'Persoon zit niet in een voertuig', 'error');
        return;
      }
    }
    Events.emitNet('admin:commands:teleportInVehicle', caller.source, NetworkGetNetworkIdFromEntity(vehicle));
  },
  UI: {
    title: 'Teleport In Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
