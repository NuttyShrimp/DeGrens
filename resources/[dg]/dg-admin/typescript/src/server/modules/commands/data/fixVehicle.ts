import { Events, Vehicles } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface FixVehicleData {
  Target: UI.Player;
  entity: number;
}

export const fixVehicle: CommandData = {
  name: 'fixVehicle',
  role: 'support',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'fixed a vehicle',
  handler: (caller, args: FixVehicleData) => {
    let vehicle = args?.entity;
    if (!vehicle) {
      const plyId = args?.Target?.serverId ?? caller.source;
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
    }
    Vehicles.doAdminFix(vehicle);
  },
  UI: {
    title: 'Fix Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
    bindable: true,
  },
};
