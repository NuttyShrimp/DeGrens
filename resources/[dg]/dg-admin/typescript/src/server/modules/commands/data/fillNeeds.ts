import { Hospital } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface ReviveData {
  Target: UI.Player;
  entity: number;
}

export const fillNeeds: CommandData = {
  name: 'fillNeeds',
  role: 'staff',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  log: 'filled a players needs',
  handler: (caller, args: ReviveData) => {
    let ply = caller.source;
    if (args?.entity) {
      ply = NetworkGetEntityOwner(args.entity);
    } else if (args?.Target) {
      ply = args.Target.serverId;
    }
    Hospital.setNeed(ply, 'hunger', () => 100);
    Hospital.setNeed(ply, 'thirst', () => 100);
  },
  UI: {
    title: 'Fill Needs',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
