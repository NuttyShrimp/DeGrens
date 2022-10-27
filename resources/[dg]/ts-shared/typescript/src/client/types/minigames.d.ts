declare namespace Minigames {
  namespace Keygame {
    type Cycle = {
      speed: number;
      size: number;
    };
  }

  namespace GridGame {
    type Game = 'sequence' | 'order' | 'vision';

    type BaseGameData = {
      gridSize: number;
    };

    type OrderGameData = BaseGameData & {
      game: 'order';
      amount: number;
      length: number;
      displayTime: number;
      inputTime: number;
    };

    type SequenceGameData = BaseGameData & {
      game: 'sequence';
      length: number;
      inputTime: number;
    };

    type VisionGameData = BaseGameData & {
      game: 'vision';
      time: number;
    };

    type GenericGameData = OrderGameData | VisionGameData | SequenceGameData;
  }
}
