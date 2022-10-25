import { Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface RefuelVehicleData {
  Target: UI.Player;
  entity: number;
}

export const refuelVehicle: CommandData = {
  name: 'refuelVehicle',
  role: 'staff',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'refueled a vehicle',
  handler: (caller, args: RefuelVehicleData) => {
    let vehicle = args?.entity;
    if (!vehicle) {
      const plyId = args?.Target?.serverId ?? caller.source;
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
    }
    const vin = global.exports['dg-vehicles'].getVinForVeh(vehicle);
    if (!vin) {
      Notifications.add(caller.source, 'Could not find vehicle', 'error');
      return;
    }
    global.exports['dg-vehicles'].setFuelLevel(vin, 100);
  },
  UI: {
    title: 'Refuel Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
    bindable: true,
  },
};
