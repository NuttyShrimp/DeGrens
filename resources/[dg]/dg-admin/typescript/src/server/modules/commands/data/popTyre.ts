import { Vehicles } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';

interface ExplodeVehicleData {
  entity?: number;
}

export const popTyre: CommandData = {
  name: 'popTyre',
  role: 'developer',
  log: 'popped a tyre',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  handler: (caller, args?: ExplodeVehicleData) => {
    const vehicle = args?.entity;
    if (!vehicle) return;
    Vehicles.popTyre(vehicle);
  },
  UI: {
    title: 'Pop One Tyre',
  },
};
