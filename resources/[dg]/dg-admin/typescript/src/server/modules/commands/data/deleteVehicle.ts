import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface DeleteVehicleData {
  Target?: UI.Player;
}

export const deleteVehicle: CommandData = {
  name: 'deleteVehicle',
  role: 'support',
  log: 'has deleted the vehicle a player was in',
  target: false,
  isClientCommand: false,
  handler: (caller, args?: DeleteVehicleData) => {
    const plyId = args?.Target?.serverId ?? caller.source;
    const plyPed = GetPlayerPed(String(plyId));
    const veh = GetVehiclePedIsIn(plyPed, false);
    if (!veh) {
      Notifications.add(caller.source, 'Speler zit niet in een voertuig', 'error');
      return;
    }
    global.exports['dg-vehicles'].deleteVehicle(veh);
  },
  UI: {
    title: 'Delete Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
    bindable: true,
  },
};
