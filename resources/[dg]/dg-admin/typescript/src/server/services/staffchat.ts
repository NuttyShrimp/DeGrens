import { Admin, Chat } from '@dgx/server';

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
    Chat.sendMessage('admin', {
      prefix: 'Staff Chat: ',
      message: fullMessage,
      type: 'normal',
    });
  }
);
