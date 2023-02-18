import { Admin, Chat, Util } from '@dgx/server';

Chat.registerCommand(
  's',
  'stuur bericht in staffchat',
  [
    {
      name: 'message',
      description: 'bericht',
      required: true,
    },
  ],
  'staff',
  (plyId, _, args) => {
    if (!Admin.hasPermission(plyId, 'staff')) return;
    const fullMessage = args.join(' ');
    const steamName = Util.getName(plyId);
    Chat.sendMessage('admin', {
      prefix: `SC | ${steamName}: `,
      message: fullMessage,
      type: 'normal',
    });
  }
);
