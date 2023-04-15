import { RPC, Events, UI, Util, Minigames } from '../index';

if (GetCurrentResourceName() === 'ts-shared') {
  // Util RPC to be used from server
  RPC.register('dgx:util:isEntityDead', (entityNetId: number) => {
    const entity = NetworkGetEntityFromNetworkId(entityNetId);
    if (!entity || !DoesEntityExist(entity)) return false;
    return Boolean(IsEntityDead(entity));
  });

  RPC.register('dgx:util:isInWater', () => {
    const plyPed = PlayerPedId();
    return IsEntityInWater(plyPed);
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

  // @ts-ignore
  Events.onNet('dgx:minigames:playGame', async (resName: string, id: number, ...args: Minigames.HandlerParams) => {
    const getRetVal = () => {
      const [game, ...data] = args;
      switch (game) {
        case 'keygame': {
          // @ts-ignore
          return Minigames.keygame(...data);
        }
        case 'order': {
          // @ts-ignore
          return Minigames.ordergame(...data);
        }
        case 'sequence': {
          // @ts-ignore
          return Minigames.sequencegame(...data);
        }
        case 'vision': {
          // @ts-ignore
          return Minigames.visiongame(...data);
        }
        case 'keygameCustom': {
          // @ts-ignore
          return Minigames.keygameCustom(...data);
        }
        case 'keypad': {
          // @ts-ignore
          return Minigames.keypad(...data);
        }
        default:
          return false;
      }
    };
    const retVal = await getRetVal();
    Events.emitNet(`dgx:minigames:finishGame:${resName}`, id, retVal);
  });
}
