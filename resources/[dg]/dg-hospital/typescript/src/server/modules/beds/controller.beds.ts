import { Chat } from '@dgx/server';
import { sendToClosestBed } from './service.beds';

Chat.registerCommand('bed', 'Ga in een ziekenhuis bed liggen', [], 'user', src => {
  sendToClosestBed(src);
});
