import { Police } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface ReviveData {
  Target: UI.Player;
  entity: number;
}

export const cycleCuffs: CommandData = {
  name: 'cycleCuffs',
  role: 'staff',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  log: 'cycled cuffs for a player',
  handler: (caller, args: ReviveData) => {
    let ply = caller.source;
    if (args?.entity) {
      ply = NetworkGetEntityOwner(args.entity);
    } else if (args?.Target) {
      ply = args.Target.serverId;
    }

    Police.cycleCuffs(ply);
  },
  UI: {
    title: 'Cycle Cuffs',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
