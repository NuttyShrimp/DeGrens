class Minigames {
  public keygame = (amount: number, difficulty: 'easy' | 'medium' | 'hard' | 'extreme'): Promise<boolean> => {
    return new Promise<boolean>(res => {
      global.exports['dg-keygame'].OpenGame(
        (result: boolean) => {
          res(result);
        },
        amount,
        difficulty
      );
    });
  };

  /**
   * Time in seconds
   */
  public numbergame = (gridSize: number, time: number): Promise<boolean> => {
    return new Promise<boolean>(res => {
      global.exports['dg-numbergame'].OpenGame(
        (result: boolean) => {
          res(result);
        },
        gridSize,
        time
      );
    });
  };

  /**
   * Time in seconds
   */
  public ordergame = (
    gridSize: number,
    length: number,
    amount: number,
    showTime: number,
    inputTime: number
  ): Promise<boolean> => {
    return new Promise<boolean>(res => {
      global.exports['dg-ordergame'].OpenGame(
        (result: boolean) => {
          res(result);
        },
        gridSize,
        length,
        amount,
        showTime,
        inputTime
      );
    });
  };

  public sequencegame = (gridSize: number, length: number): Promise<boolean> => {
    return new Promise<boolean>(res => {
      global.exports['dg-sequencegame'].OpenGame(
        (result: boolean) => {
          res(result);
        },
        gridSize,
        length
      );
    });
  };
}

export default {
  Minigames: new Minigames(),
};
