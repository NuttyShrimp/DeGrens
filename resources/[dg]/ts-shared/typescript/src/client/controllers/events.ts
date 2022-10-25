import { RPC, Events, UI } from '../index';

if (GetCurrentResourceName() === 'ts-shared') {
  // Util RPC to be used from server
  RPC.register('dgx:util:isEntityDead', (entityNetId: number) => {
    const entity = NetworkGetEntityFromNetworkId(entityNetId);
    if (!entity || !DoesEntityExist(entity)) return false;
    return Boolean(IsEntityDead(entity));
  });

  Events.onNet('dgx:client:ui:openContextmenu', (menu: ContextMenu.Entry[]) => {
    UI.openApplication('contextmenu', menu);
  });
}
