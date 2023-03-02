declare namespace Labs {
  type Config = {
    locations: LocationConfig[];
    interiors: Record<Type, InteriorConfig>;
    // Custom data per type
    weed: Weed.Config;
    meth: Meth.Config;
    coke: Coke.Config;
  };

  type LocationConfig = {
    coords: Vec3;
    doorId: string;
    disabled?: boolean;
  };

  type InteriorConfig = {
    refreshTimeout: number;
    interiorProps: string[];
    peekZones: {
      action: string;
      coords: Vec3;
      data?: Record<string, any>;
    }[];
  };

  type Type = 'weed' | 'coke' | 'meth';

  type ActiveLab = {
    id: number;
  } & InteriorConfig &
    LocationConfig;

  type DBLab = {
    id: number;
    refreshTime: number;
    type: Type;
  };

  namespace Weed {
    type Plants = { canFertilize: boolean; canHarvest: boolean }[];

    type Config = {
      harvestDelay: number;
      timeout: number;
      rewardChance: number;
      rewards: string[];
      dry: {
        timeout: number;
        amount: {
          min: number;
          max: number;
        };
      };
    };
  }

  namespace Meth {
    type Config = {
      fillAmount: number;
      resetTime: number;
      dryTime: number;
      hack: {
        length: number;
        time: number;
        gridSize: number;
      };
    };

    type State = {
      timedOut: boolean;
      started: boolean;
      startCid: number;
      stations: Station[];
    };

    type Settings = {
      power: [number, number];
      amount: [number, number];
    };

    type Station = {
      settings: Settings;
      amount: number;
    };
  }

  namespace Coke {
    type Config = {};
    type State = {};
  }
}
