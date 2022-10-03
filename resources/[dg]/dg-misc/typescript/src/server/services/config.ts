import { Chat, Events } from '@dgx/server';

Chat.registerCommand('config', 'Wijzig je voorkeuren', [], 'user', src => {
  Events.emitNet('dg-misc:openConfigMenu', src);
});
