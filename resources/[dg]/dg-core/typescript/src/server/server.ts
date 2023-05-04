import { startAllModules, stopAllModules } from 'moduleController';
import './controllers/commands';
import './controllers/events';
import './controllers/exports';

setImmediate(() => {
  startAllModules();
});

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  stopAllModules();
});
