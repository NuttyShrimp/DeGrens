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
  role: 'staff',
  handler: (caller, args: TakeScreenshotData) => {
    if (!args.Target) {
      Notifications.add(caller.source, 'Je moet een target invullen', 'error');
      return;
    }
    if (args.Target.serverId === caller.source) {
      Notifications.add(caller.source, 'Je kan dit niet van jezelf', 'error');
      return;
    }

    // dumb ass fucking way to let client copy it without much work for me atm
    Screenshot.imgur(args.Target.serverId).then(link => {
      UI.openInput(caller.source, {
        header: `Link of screenshot: ${link}`,
      });
    });
  },
  UI: {
    title: 'Take Screenshot',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
