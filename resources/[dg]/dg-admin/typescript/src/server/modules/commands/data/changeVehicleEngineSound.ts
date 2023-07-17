import { Events, Vehicles } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface ChangeVehicleEngineSoundData {
  Target?: UI.Player;
}

export const changeVehicleEngineSound: CommandData = {
  name: 'changeVehicleEngineSound',
  role: 'developer',
  log: 'has opened vehicle engine sound menu',
  target: false,
  isClientCommand: false,
  handler: (caller, args: ChangeVehicleEngineSoundData) => {
    const targetId = args.Target?.serverId ?? caller.source;
    if (targetId === caller.source) {
      Events.emitNet('admin:menu:forceClose', caller.source);
    }
    Vehicles.openEngineSoundMenu(targetId);
  },
  UI: {
    title: 'Change Vehicle Engine Sound',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
