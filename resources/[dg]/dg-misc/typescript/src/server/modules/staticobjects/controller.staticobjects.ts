import { Auth } from '@dgx/server';
import {
  addStaticObject,
  logAllToConsole,
  removeStaticObject,
  syncStaticObjectsToClient,
} from './service.staticobjects';

global.exports('addStaticObject', addStaticObject);
global.exports('removeStaticObject', removeStaticObject);

RegisterCommand(
  'debug:server:staticObjects',
  () => {
    logAllToConsole();
  },
  true
);

Auth.onAuth(plyId => {
  syncStaticObjectsToClient(plyId);
});
