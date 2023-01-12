import { Events } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';
import { SelectorTarget } from '../../../enums/SelectorTargets';

declare interface ResetPlayerPropsData {
  Target: UI.Player;
  entity: number;
}

export const resetPlayerProps: CommandData = {
  name: 'resetPlayerProps',
  role: 'developer',
  log: "has reset a player's props",
  isClientCommand: false,
  target: [SelectorTarget.PLAYER],
  handler: (caller, args: ResetPlayerPropsData) => {
    let target;
    if (args.entity && IsPedAPlayer(args.entity)) {
      target = NetworkGetEntityOwner(args.entity);
    } else if (args.Target?.serverId) {
      target = args.Target.serverId;
    } else {
      target = caller.source;
    }
    global.exports['dg-misc'].clearProps(target);
  },
  UI: {
    title: 'Reset Player Props',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
