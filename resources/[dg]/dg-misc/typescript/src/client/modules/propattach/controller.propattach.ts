import { Events } from '@dgx/client';
import { addProp, loadIsEnabled, moveProp, removeProp, resetProps, toggleProps } from './service.propattach';

global.exports('addProp', addProp);
global.exports('removeProp', removeProp);
global.exports('moveProp', moveProp);

global.exports('toggleProps', toggleProps);

Events.onNet('propattach:reset', () => {
  resetProps();
});

onNet('dg-chars:client:finishSpawn', () => {
  setTimeout(() => {
    toggleProps(true);
  }, 1000);
});

onNet('DGCore:server:playerUnloaded', () => {
  resetProps();
});

on('onResourceStart', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  loadIsEnabled();
});
