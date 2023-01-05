import { Events } from '@dgx/client';
import { addProp, isEnabled, moveProp, removeProp, resetProps, toggleProps } from './service.propattach';

global.asyncExports('addProp', addProp);
global.exports('removeProp', removeProp);
global.exports('moveProp', moveProp);
global.asyncExports('toggleProps', toggleProps);

Events.onNet('propattach:reset', () => {
  resetProps();
});

on('baseevents:playerPedChanged', async () => {
  if (!isEnabled()) return;
  toggleProps(false);
  setTimeout(() => {
    toggleProps(true);
  }, 250);
});
