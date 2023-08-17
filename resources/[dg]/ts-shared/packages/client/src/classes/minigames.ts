import { Util } from './index';

class Minigames {
  private generateKeygameCycle = (speed: number, size: number): Minigames.Keygame.Cycle => {
    const minSpeed = Math.round(speed - speed * 0.2);
    const maxSpeed = Math.round(speed + speed * 0.2);
    const minSize = Math.round(size - size * 0.3);
    const maxSize = Math.round(size + size * 0.3);

    const randomSpeed = Math.round(Util.getRndDecimal(minSpeed, maxSpeed) * 10) / 10;
    const randomSize = Math.round(Util.getRndDecimal(minSize, maxSize) * 10) / 10;

    return {
      speed: Math.max(randomSpeed, 0),
      size: Math.max(randomSize, 0),
    };
  };

  /**
   * All cycles will have same base speed/size (Still randomized)
   */
  public keygame = (amount: number, speed: number, size: number): Promise<boolean> => {
    const randomizedCycles: Minigames.Keygame.Cycle[] = [...new Array(amount)].map(() =>
      this.generateKeygameCycle(speed, size)
    );
    return global.exports['dg-minigames'].keygame(randomizedCycles);
  };

  /**
   * Define all cycles yourself so so they wont have the same base speed/size (Still randomized)
   * Use if you want to increase difficulity every cycle
   */
  public keygameCustom = (cycles: Minigames.Keygame.Cycle[]): Promise<boolean> => {
    const randomizedCycles = cycles.map(c => this.generateKeygameCycle(c.speed, c.size));
    return global.exports['dg-minigames'].keygame(randomizedCycles);
  };

  public sequencegame = (gridSize: number, length: number, inputTime: number): Promise<boolean> => {
    const data: Minigames.GridGame.SequenceGameData = { game: 'sequence', gridSize, length, inputTime };
    return global.exports['dg-minigames'].gridgame(data);
  };

  public ordergame = (
    gridSize: number,
    amount: number,
    length: number,
    displayTime: number,
    inputTime: number
  ): Promise<boolean> => {
    const data: Minigames.GridGame.OrderGameData = { game: 'order', gridSize, amount, length, displayTime, inputTime };
    return global.exports['dg-minigames'].gridgame(data);
  };

  public visiongame = (gridSize: number, time: number): Promise<boolean> => {
    const data: Minigames.GridGame.VisionGameData = { game: 'vision', gridSize, time };
    return global.exports['dg-minigames'].gridgame(data);
  };

  public binarysudoku = (gridSize: number, time: number): Promise<boolean> => {
    const data: Minigames.GridGame.BinarySudoku = { game: 'binarysudoku', gridSize, time };
    return global.exports['dg-minigames'].gridgame(data);
  };

  public keypad = (data: Minigames.Keypad.Data): Promise<boolean> => {
    return global.exports['dg-minigames'].keypad(data);
  };
}

export default {
  Minigames: new Minigames(),
};
