import { BaseEvents, Core, Events, Statebags } from '@dgx/client';
import {
  addProp,
  handlePlayerLeftScope,
  handlePlayerStateUpdate,
  isEnabled,
  moveProp,
  removeProp,
  resetProps,
  toggleProps,
} from './service.propattach';

global.exports('addProp', addProp);
global.exports('removeProp', removeProp);
global.exports('moveProp', moveProp);
global.exports('toggleProps', toggleProps);

Events.onNet('propattach:reset', () => {
  resetProps();
});

// Reapply props when changing ped
BaseEvents.onPedChange(() => {
  if (!isEnabled()) return;
  toggleProps(false);
  setTimeout(() => {
    toggleProps(true);
  }, 250);
});

Statebags.addEntityStateBagChangeHandler<Record<number, PropAttach.Prop>>(
  'player',
  'propattach',
  (plyId, ped, value) => {
    handlePlayerStateUpdate(plyId, ped, value);
  }
);

BaseEvents.onPlayerLeftScope(plyId => {
  handlePlayerLeftScope(plyId);
});

Core.onPlayerUnloaded(() => {
  resetProps();
});
