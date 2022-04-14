import { Chat } from '../types/chat';

export const testMessages: Chat.Message[] = [
  {
    message: 'BOZO<br>KAPP',
    prefix: 'Me:',
    type: 'normal',
  },
  {
    message: 'This is a bozo alert',
    prefix: 'System:',
    type: 'system',
  },
  {
    message: 'I am a bozo',
    prefix: 'Report(Cry baby|69): ',
    type: 'success',
  },
  {
    message: "Bozo doesn't have enough money",
    prefix: 'Bank: ',
    type: 'error',
  },
  {
    message: 'Bozo ran into a problem',
    prefix: 'System: ',
    type: 'warning',
  },
  {
    message: 'Bozo ran into a problem',
    prefix: 'System: ',
    type: 'warning',
  },
];
