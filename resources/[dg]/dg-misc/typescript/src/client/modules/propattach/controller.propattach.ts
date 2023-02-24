import { BaseEvents, Events, Util } from '@dgx/client';
import {
  addProp,
  deleteAllEntities,
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

// handler gets called twice when changing own state on client, we only need handler calls with fromOwnClient param as 'false'
// this is how it happens when other players state gets changed or we change state from server
AddStateBagChangeHandler(
  'propattach',
  //@ts-ignore
  null,
  (bagName: string, keyName: string, value: any, _: any, fromOwnClient: boolean) => {
    if (fromOwnClient) return;
    if (keyName !== 'propattach') return;
    const serverId = Number(bagName.replace('player:', ''));
    if (!serverId) return;

    // we cache local id to make sure ply for serverid is still same after timeout
    // this can happen when noclipping and ply quickly moves in/out of scope
    const cachedLocalId = GetPlayerFromServerId(serverId);

    // when entering scope, ped will not exist instantly
    setTimeout(() => {
      if (GetPlayerFromServerId(serverId) !== cachedLocalId) return;
      handlePlayerStateUpdate(serverId, value);
    }, 250);
  }
);

AddEventHandler('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  deleteAllEntities();
  resetProps();
});

Util.onPlayerUnloaded(() => {
  resetProps();
});
