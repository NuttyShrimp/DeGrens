import { Chat, Events } from '@dgx/server';

Chat.registerCommand('startrecording', 'Start een recording voor rockstar editor', [], 'user', src => {
  Events.emitNet('misc:editor:start', src);
});

Chat.registerCommand('stoprecording', 'Stop je recording voor rockstar editor', [], 'user', src => {
  Events.emitNet('misc:editor:stop', src);
});
