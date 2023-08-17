declare namespace Maze {
  type Config = {
    doorOpenDelay: number; // minutes
    emptyLocationTimeForReset: number; // minutes
    resetTime: number; // minutes
  };

  type BusyActions = {
    panelHack: boolean;
  };

  type State = {
    hacked: boolean;
    awaitingEmptyLocation: boolean;
  };
}
