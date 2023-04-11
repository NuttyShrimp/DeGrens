declare namespace Minigames {
  type Game = 'keygame' | 'sequence' | 'order' | 'vision' | 'keypad';

  type HandlerParams =
    | ['keygame', number, number, number]
    | ['sequence', number, number, number]
    | ['order', number, number, number, number, number]
    | ['vision', number, number]
    | ['keygameCustom', Keygame.Cycle[]]
    | ['keypad', Keypad.Data];

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

  namespace Keypad {
    type Data = {
      buttons?: string[]; // LENGTH 10
      solution: string;
    };
  }
}
