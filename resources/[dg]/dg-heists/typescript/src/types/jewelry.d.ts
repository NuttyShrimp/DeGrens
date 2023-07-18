declare namespace Jewelry {
  type Config = {
    prices: {
      card: number;
      info: number;
    };
    hack: {
      gridSize: number;
      amount: number;
      length: number;
      displayTime: number;
      inputTime: number;
    };
    doorOpenTime: number; // seconds
    overrideDuration: number; // minutes
    emptyLocationRequirementTime: number; // minutes
    resetTime: number; // minutes
    loot: { itemName: string; amount: [number, number] }[];
    laptopLocations: Vec4[];
    vitrines: VitrineConfig[];
  };

  type InitData = {
    vitrines: VitrineConfig[];
    alarmEnabled: boolean;
  };

  type State = {
    doorOpen: boolean;
    started: boolean;
    alarmOverridden: boolean;
  };

  type Actions = {
    laptopHack: boolean;
    overridingAlarm: boolean;
  };

  type VitrineConfig = {
    coords: Vec4;
    modelIdx: number;
  };
}
