import { RPC, Events, UI, Util, Minigames } from '../index';

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

  Events.onNet('dgx:minigames:playGame', async (id: number, ...args: any[]) => {
    const getRetVal = () => {
      switch (args[0]) {
        case 'keygame': {
          // @ts-ignore
          return Minigames.keygame(...args.slice(1));
        }
        case 'order': {
          // @ts-ignore
          return Minigames.ordergame(...args.slice(1));
        }
        case 'sequence': {
          // @ts-ignore
          return Minigames.sequencegame(...args.slice(1));
        }
        case 'vision': {
          // @ts-ignore
          return Minigames.visiongame(...args.slice(1));
        }
        default:
          return false;
      }
    };
    const retVal = await getRetVal();
    Events.emitNet('dgx:minigames:finishGame', id, retVal);
  });
}
