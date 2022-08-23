import { Notifications, Util } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface BringData {
  Target: UI.Player;
}

export const bring: CommandData = {
  name: 'bring',
  log: 'brought someone to them',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: BringData) => {
    if (caller.steamId === data.Target.steamId) {
      Notifications.add(caller.source, "You can't bring yourself", 'error');
      return;
    }
    const targetPed = GetPlayerPed(String(data.Target.serverId));
    const callerCoords = Util.getPlyCoords(caller.source);
    SetEntityCoords(targetPed, callerCoords.x, callerCoords.y, callerCoords.z, true, false, false, false);
    Notifications.add(caller.source, `Successfully brought ${data.Target.name} to you`, 'success');
  },
  UI: {
    title: 'Bring',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
