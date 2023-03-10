import { Events, Hospital } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface ReviveData {
  Target: UI.Player;
  entity: number;
}

export const revive: CommandData = {
  name: 'revive',
  role: 'support',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  log: 'revived a player',
  handler: (caller, args: ReviveData) => {
    let ply = caller.source;
    if (args?.entity) {
      ply = NetworkGetEntityOwner(args.entity);
    } else if (args?.Target) {
      ply = args.Target.serverId;
    }
    Hospital.revivePlayer(ply);
  },
  UI: {
    title: 'Revive',
    info: {
      inputs: [Inputs.Player],
    },
    bindable: true,
    favorite: true,
  },
};
