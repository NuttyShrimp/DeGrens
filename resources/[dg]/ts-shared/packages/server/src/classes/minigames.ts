import { Events } from './index';

class Minigames {
  private games: Record<number, Record<number, (...args: any) => void>> = {};
  private id = 0;
  private readonly resName: string;

  constructor() {
    this.resName = GetCurrentResourceName();
    setImmediate(() => {
      Events.onNet(`dgx:minigames:finishGame:${this.resName}`, (src, id: number, result: boolean) => {
        if (!this.games[src][id]) return;
        this.games[src][id](result);
      });
    });
  }

  private playGame = (src: number, id: number, ...args: Minigames.HandlerParams) => {
    Events.emitNet('dgx:minigames:playGame', src, this.resName, id, ...args);
  };

  public keygame = (src: number, amount: number, speed: number, size: number): Promise<boolean> => {
    this.playGame(src, ++this.id, 'keygame', amount, speed, size);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };

  public keygameCustom = (src: number, cycles: Minigames.Keygame.Cycle[]): Promise<boolean> => {
    this.playGame(src, ++this.id, 'keygameCustom', cycles);
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

  public binarysudoku = (src: number, gridSize: number, time: number): Promise<boolean> => {
    this.playGame(src, ++this.id, 'binarysudoku', gridSize, time);
    return new Promise<boolean>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };

  public keypad = (src: number, data: Minigames.Keypad.Data = {}) => {
    this.playGame(src, ++this.id, 'keypad', data);
    return new Promise<[boolean, string]>(res => {
      if (!this.games[src]) this.games[src] = {};
      this.games[src][this.id] = res;
    });
  };
}

export default {
  Minigames: new Minigames(),
};
