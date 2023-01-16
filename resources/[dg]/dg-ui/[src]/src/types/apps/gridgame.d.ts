declare namespace Gridgame {
  type State = {
    gridSize: number;
    active: Game | null;
    id: string;
    data: OrderGameData | SequenceGameData | LogicGameData | null;
    cells: Cells[];
  };

  interface StateActions {
    startGame: (id: string, active: Game, size: number, data: GameData) => void;
    resetGame: () => void;
    setCells: (cells: Cells[]) => void;
  }

  type GameData = BaseGameData &
    (
      | ({ game: 'order' } & OrderGameData)
      | ({ game: 'sequence' } & SequenceGameData)
      | ({ game: 'logic' } & LogicGameData)
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

  type Game = 'sequence' | 'order' | 'vision';

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
