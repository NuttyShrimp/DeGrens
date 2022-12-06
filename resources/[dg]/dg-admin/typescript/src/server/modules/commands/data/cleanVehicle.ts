import { Vehicles } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface CleanVehicleData {
  Target?: UI.Player;
  entity?: number;
}

export const cleanVehicle: CommandData = {
  name: 'cleanVehicle',
  role: 'staff',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'cleaned a vehicle',
  handler: (caller, args: CleanVehicleData) => {
    let vehicle = args?.entity;
    if (!vehicle) {
      const plyId = args?.Target?.serverId ?? caller.source;
      vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
    }
    Vehicles.cleanVehicle(NetworkGetNetworkIdFromEntity(vehicle));
  },
  UI: {
    title: 'Clean Vehicle',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
