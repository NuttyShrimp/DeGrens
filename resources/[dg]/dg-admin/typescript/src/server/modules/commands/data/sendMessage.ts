import { Chat, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface SendMessageData {
  Target?: UI.Player;
  message?: string;
}

// TODO: Integrate this in a proper way, just a quick temp solution

export const sendMessage: CommandData = {
  name: 'sendMessage',
  log: 'has sent a message to someone',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, args: SendMessageData) => {
    if (!args.Target || !args.message) return;

    Chat.sendMessage(args.Target.serverId, {
      prefix: `Admin ${caller.name}: `,
      message: args.message,
      type: 'system',
    });

    Notifications.add(caller.source, `Bericht verzonden naar ${args.Target.name}`);
  },
  UI: {
    title: 'Send Message',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['message'],
    },
  },
};
