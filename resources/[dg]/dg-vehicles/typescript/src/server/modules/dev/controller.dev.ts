import { Chat } from '@dgx/server';
import { startVehicleExistenceThread } from './service.dev';

Chat.registerCommand(
  'startExistenceThread',
  '(DEV) Start Existence Thread for current vehicle',
  [],
  'developer',
  plyId => {
    startVehicleExistenceThread(plyId);
  }
);
