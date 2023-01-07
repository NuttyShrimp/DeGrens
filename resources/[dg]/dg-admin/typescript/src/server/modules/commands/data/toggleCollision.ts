import { Events, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';
import { SelectorTarget } from 'enums/SelectorTargets';

interface ToggleCollisionData {
  Target?: UI.Player;
  entity?: number;
}

export const toggleCollision: CommandData = {
  name: 'toggleCollision',
  log: 'toggled collision',
  isClientCommand: false,
  target: [SelectorTarget.PLAYER],
  role: 'developer',
  handler: (caller, args: ToggleCollisionData) => {
    let ply = caller.source;
    if (args?.entity) {
      ply = NetworkGetEntityOwner(args.entity);
    } else if (args?.Target) {
      ply = args.Target.serverId;
    }

    Events.emitNet('admin:command:collision', ply);
  },
  UI: {
    title: 'Toggle Collision',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
