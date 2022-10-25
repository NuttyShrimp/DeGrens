import { Notifications } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

declare interface SpawnVehicleData {
  VehicleModel?: UI.VehicleModel;
  vin?: string;
  modelOverride?: string;
  mods: boolean;
}

// If no vin, spawn new
// If vin provided check if vin is playervehif ifso spawn that veh
// Else spawn new veh and give it provided vin
export const spawnVehicle: CommandData = {
  name: 'spawnVehicle',
  role: 'staff',
  log: 'has spawned a vehicle',
  isClientCommand: false,
  target: false,
  handler: (caller, args: SpawnVehicleData) => {
    let model = args?.modelOverride;
    if (!model || model === '') {
      model = args?.VehicleModel?.model;
    }
    global.exports['dg-vehicles'].spawnVehicleFromAdminMenu(caller.source, model, args.vin, args.mods);
  },
  UI: {
    title: 'Spawn Vehicle',
    info: {
      inputs: [Inputs.VehicleModel],
      overrideFields: ['vin', 'modelOverride'],
      checkBoxes: ['mods'],
    },
  },
};
