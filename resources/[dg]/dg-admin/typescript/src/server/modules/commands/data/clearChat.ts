import { Events } from '@dgx/server';

export const clearChat: CommandData = {
  name: 'clearChat',
  log: 'has cleared everyones chat',
  role: 'support',
  target: false,
  isClientCommand: false,
  handler: () => {
    Events.emitNet('chat:clear', -1);
  },
  UI: {
    title: 'Clear Chat',
    oneTime: true,
  },
};
