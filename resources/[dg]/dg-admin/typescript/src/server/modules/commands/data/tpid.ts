import { Notifications, Util } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

interface TpIdData {
  Target?: UI.Player;
}

export const tpid: CommandData = {
  name: 'tpid',
  role: 'staff',
  log: 'teleported to a player',
  target: false,
  isClientCommand: false,
  handler: (caller, args: TpIdData) => {
    if (caller.steamId === args.Target.steamId) {
      Notifications.add(caller.source, "You can't tp to yourself", 'error');
      return;
    }
    const callerPed = GetPlayerPed(String(caller.source));
    if (!callerPed) return;
    const targetCoords = Util.getPlyCoords(args.Target.serverId);
    SetEntityCoords(callerPed, targetCoords.x, targetCoords.y, targetCoords.z, true, true, true, false);
  },
  UI: {
    title: 'Teleport to a player',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
