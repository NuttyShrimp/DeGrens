import { Gangs, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

type AddGangFeedMessageData = {
  Gang?: UI.Gang;
  title?: string;
  content?: string;
};

export const addGangFeedMessage: CommandData = {
  name: 'addGangFeedMessage',
  log: 'has added a gang feed message',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: (caller, args: AddGangFeedMessageData) => {
    if (!args.content || !args.title) {
      Notifications.add(caller.source, 'Je moet een titel en content opgeven', 'error');
      return;
    }

    const newMessage: Gangs.Feed.NewMessage = {
      title: args.title,
      content: args.content,
    };
    if (args.Gang) {
      newMessage.gang = args.Gang.name;
    }

    Gangs.addFeedMessage(newMessage);
    Notifications.add(caller.source, 'Je hebt een gang feed message uitgezonden', 'success');
  },
  UI: {
    title: 'Gang - Add Feed Message',
    info: {
      inputs: [Inputs.Gang],
      overrideFields: ['title', 'content'],
    },
  },
};
