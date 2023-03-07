import { Events, Notifications, Util } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

interface TpIdData {
  Target?: UI.Player;
}

export const tpid: CommandData = {
  name: 'tpid',
  role: 'support',
  log: 'teleported to a player',
  target: false,
  isClientCommand: false,
  handler: (caller, args: TpIdData) => {
    if (!args.Target?.serverId) return;
    if (caller.source === args.Target?.serverId) {
      Notifications.add(caller.source, "You can't tp to yourself", 'error');
      return;
    }

    const targetCoords = Util.getPlyCoords(args.Target.serverId);
    Events.emitNet('admin:util:setPedCoordsKeepVehicle', caller.source, targetCoords);
  },
  UI: {
    title: 'Teleport to a player',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
