import { Notifications } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';
import { Inputs } from '../../../enums/inputs';

interface GetVehicleKeysData {
  Target?: UI.Player;
  entity?: number;
}

export const getVehicleKeys: CommandData = {
  name: 'getVehicleKeys',
  role: 'staff',
  log: 'has taken keys of a vehicle',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  handler: (caller, args?: GetVehicleKeysData) => {
    const plyId = args?.Target?.serverId ?? caller.source;

    let vehicle = args?.entity;
    if (!vehicle) {
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
    }

    if (!vehicle) {
      Notifications.add(caller.source, 'Speler zit niet in een voertuig', 'error');
      return;
    }
    global.exports['dg-vehicles'].giveKeysToPlayer(plyId, NetworkGetNetworkIdFromEntity(vehicle));
  },
  UI: {
    title: 'Give Vehicle Keys',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
