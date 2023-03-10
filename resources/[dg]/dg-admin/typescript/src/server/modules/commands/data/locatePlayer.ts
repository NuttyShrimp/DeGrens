import { Notifications, Util } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface LocatePlayerData {
  Target?: UI.Player;
}

export const locatePlayer: CommandData = {
  name: 'locatePlayer',
  role: 'staff',
  log: 'has located a player',
  isClientCommand: false,
  target: false,
  handler: (caller, args: LocatePlayerData) => {
    const targetId = args?.Target?.serverId;
    if (!targetId) {
      Notifications.add(caller.source, 'Je moet een target invullen', 'error');
      return;
    }
    if (targetId === caller.source) {
      Notifications.add(caller.source, 'Je kan dit niet van jezelf', 'error');
      return;
    }

    const targetCoords = Util.getPlyCoords(targetId);
    Util.setWaypoint(caller.source, targetCoords);
  },
  UI: {
    title: 'Locate Player',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
