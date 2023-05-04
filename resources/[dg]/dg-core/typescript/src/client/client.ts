import { startAllModules, stopAllModules } from 'moduleController';
import './controllers/exports';

setImmediate(() => {
  startAllModules();
});

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  stopAllModules();
});
