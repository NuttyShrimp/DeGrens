import { Notifications, Sync, UI, Vehicles } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';
import { Inputs } from '../../../enums/inputs';

interface ExplodeVehicleData {
  Target?: UI.Player;
  entity?: number;
}

export const copyVin: CommandData = {
  name: 'copyVin',
  role: 'support',
  log: 'has copied a vehicles vin',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  handler: (caller, args?: ExplodeVehicleData) => {
    let vehicle = args?.entity;
    if (!vehicle) {
      const targetPlyId = args?.Target?.serverId ?? caller.source;
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(targetPlyId)), false);
    }

    if (!vehicle || !DoesEntityExist(vehicle)) {
      Notifications.add(caller.source, 'Vehicle does not exist', 'error');
      return;
    }

    const vin = Vehicles.getVinForVeh(vehicle);
    if (!vin) {
      Notifications.add(caller.source, 'Vehicle does not have a vin', 'error');
      return;
    }

    UI.addToClipboard(caller.source, vin);
    Notifications.add(caller.source, 'Copied vin to clipboard', 'success');
  },
  UI: {
    title: 'Copy VIN',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
