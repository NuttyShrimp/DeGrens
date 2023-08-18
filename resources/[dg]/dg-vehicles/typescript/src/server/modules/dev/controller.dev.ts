import { Chat } from '@dgx/server';
import devModule from './service.dev';

Chat.registerCommand(
  'startExistenceThread',
  '(DEV) Start Existence Thread for current vehicle',
  [],
  'developer',
  plyId => {
    devModule.startVehicleExistenceThread(plyId);
  }
);
