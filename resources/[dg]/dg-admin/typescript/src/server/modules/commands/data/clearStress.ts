import { Util } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface ReviveData {
  Target: UI.Player;
  entity: number;
}

export const clearStress: CommandData = {
  name: 'clearStress',
  role: 'staff',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  log: 'cleared a players stress',
  handler: (caller, args: ReviveData) => {
    let ply = caller.source;
    if (args?.entity) {
      ply = NetworkGetEntityOwner(args.entity);
    } else if (args?.Target) {
      ply = args.Target.serverId;
    }
    Util.changePlayerStress(ply, -100);
  },
  UI: {
    title: 'Clear Stress',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
