declare namespace Gridgame {
  type State = {
    gridSize: number;
    active: Game | null;
    id: string;
    data: OrderGameData | SequenceGameData | VisionGameData | BinarySudokuData | null;
    cells: Cell[];
  };

  interface StateActions {
    startGame: (id: string, active: Game, size: number, data: State['data']) => void;
    resetGame: () => void;
    setCells: (cb: (oldCells: Cell[]) => Cell[]) => void;
  }

  type GameData = BaseGameData &
    (
      | ({ game: 'order' } & OrderGameData)
      | ({ game: 'sequence' } & SequenceGameData)
      | ({ game: 'vision' } & VisionGameData)
      | ({ game: 'binarysudoku' } & BinarySudokuData)
    );

  type BaseGameData = {
    gridSize: number;
  };

  type OrderGameData = {
    amount: number;
    length: number;
    displayTime: number;
    inputTime: number;
  };

  type SequenceGameData = {
    length: number;
    inputTime: number;
  };

  type VisionGameData = {
    time: number;
  };

  type BinarySudokuData = {
    time: number;
  };

  type Game = GameData['game'];

  type Cell = {
    id: number;
    active: boolean;
    label?: string | number;
    displayLabel?: boolean;
    color?: string;
    data?: { [key: string]: any };
  };

  type ClickHandler = (cell: Cell) => void;

  type InfoDisplay = {
    text: string;
    color: string;
  };

  type GameComponentProps = BaseGameData & { finishGame: (success: boolean) => void };
}
