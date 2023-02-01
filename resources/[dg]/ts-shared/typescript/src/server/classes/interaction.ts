import { RPC, Util } from './index';
import { Events } from '../classes';

class Chat {
  registerCommand(
    name: string,
    description: string,
    parameters: Chat.Parameter[] = [],
    permissionLevel = 'user',
    handler: Chat.CommandHandler
  ) {
    setImmediate(async () => {
      await Util.awaitCondition(() => GetResourceState('dg-chat') === 'started');
      global.exports['dg-chat'].registerCommand(name, description, parameters, permissionLevel, handler);
    });
  }
  sendMessage(target: string | number, data: Chat.Message) {
    global.exports['dg-chat'].sendMessage(target, data);
  }
}

class RayCast {
  doRaycast = async (plyId: number, distance?: number, flag?: number, ignore?: number): Promise<RayCastHit> => {
    const result = await RPC.execute<Omit<RayCastHit, 'entity'> & { netId: number }>(
      'lib:doRaycast',
      plyId,
      distance,
      flag,
      ignore
    );
    if (!result) return {};
    return {
      entity: result.netId != undefined ? NetworkGetEntityFromNetworkId(result.netId) : undefined,
      coords: result.coords,
    };
  };
}

class Minigames {
  private games: Record<number, Record<number, (result: boolean) => void>> = {};
  private id = 0;

  constructor() {
    setImmediate(() => {
      Events.onNet('dgx:minigames:finishGame', (src, id: string, result: boolean) => {
        if (!id.match(/(.*)-(\d+)$/) || !id.match(`${GetCurrentResourceName()}-`)) return;
        const gameId = Number(id.match(/-(\d+)$/)?.[1] ?? '-1');
        if (gameId < 0) return;
        if (!this.games[src][gameId]) return;
        this.games[src][gameId](result);
      });
    });
  }

  private playGame = (src: number, id: number, ...args: Minigames.HandlerParams) => {
    Events.emitNet('dgx:minigames:playGame', src, `${GetCurrentResourceName()}-${id}`, ...args);
  };

  public keygame = (src: number, amount: number, speed: number, size: number): Promise<boolean> => {
    this.playGame(src, ++this.id, 'keygame', amount, speed, size);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };
  public sequencegame = (src: number, gridSize: number, length: number, inputTime: number): Promise<boolean> => {
    this.playGame(src, ++this.id, 'sequence', gridSize, length, inputTime);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };

  public ordergame = (
    src: number,
    gridSize: number,
    amount: number,
    length: number,
    displayTime: number,
    inputTime: number
  ): Promise<boolean> => {
    this.playGame(src, ++this.id, 'order', gridSize, amount, length, displayTime, inputTime);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };

  public visiongame = (src: number, gridSize: number, time: number): Promise<boolean> => {
    this.playGame(src, ++this.id, 'vision', gridSize, time);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };
}

export default {
  Chat: new Chat(),
  RayCast: new RayCast(),
  Minigames: new Minigames(),
};
