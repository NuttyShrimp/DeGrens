import { Notifications, Phone, Screenshot, UI } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface TakeScreenshotData {
  Target?: UI.Player;
}

export const takeScreenshot: CommandData = {
  name: 'takeScreenshot',
  log: 'has taken a screenshot of someones screen',
  isClientCommand: false,
  target: [],
  role: 'support',
  handler: (caller, args: TakeScreenshotData) => {
    if (!args.Target) {
      Notifications.add(caller.source, 'Je moet een target invullen', 'error');
      return;
    }
    if (args.Target.serverId === caller.source) {
      Notifications.add(caller.source, 'Je kan dit niet van jezelf', 'error');
      return;
    }

    Notifications.add(caller.source, 'Screenshot aan het nemen, even geduld');
    Screenshot.imgur(args.Target.serverId).then(link => {
      emitNet('dg-ui:SendAppEvent', caller.source, 'copy', link);
      Notifications.add(caller.source, 'Link staat op je clipboard');
    });
  },
  UI: {
    title: 'Take Screenshot',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
