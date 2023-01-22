import { RPC, Events, UI, Util } from '../index';

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

  onNet('dgx:client:ui:openInput', async (id: string, data: UI.Input.Data) => {
    const result = await UI.openInput(data);
    emitNet('dgx:server:ui:inputResult', id, result);
  });

  onNet('dgx:client:setWaypoint', (coords: Vec2) => {
    Util.setWaypoint(coords);
  });
}
