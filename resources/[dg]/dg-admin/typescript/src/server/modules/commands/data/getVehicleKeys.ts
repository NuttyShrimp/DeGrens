import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface GetVehicleKeysData {
  Target?: UI.Player;
}

export const getVehicleKeys: CommandData = {
  name: 'getVehicleKeys',
  role: 'staff',
  log: 'has taken keys of a vehicle',
  target: false,
  isClientCommand: false,
  handler: (caller, args?: GetVehicleKeysData) => {
    const plyId = args?.Target?.serverId ?? caller.source;
    const plyPed = GetPlayerPed(String(plyId));
    const veh = GetVehiclePedIsIn(plyPed, false);
    if (!veh) {
      Notifications.add(caller.source, 'Speler zit niet in een voertuig', 'error');
      return;
    }
    global.exports['dg-vehicles'].giveKeysToPlayer(plyId, NetworkGetNetworkIdFromEntity(veh));
  },
  UI: {
    title: 'Give Vehicle Keys',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
