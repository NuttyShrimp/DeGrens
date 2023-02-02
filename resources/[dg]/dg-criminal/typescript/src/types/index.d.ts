declare namespace Criminal {
  type Config = {
    weed: Weed.Config;
    cornerselling: Cornerselling.Config;
    blackmoney: Blackmoney.Config;
  };

  namespace Weed {
    type Config = {
      food: {
        decayTime: number;
        amount: number;
      };
      growTime: number;
      cut: {
        timeout: number;
        breakChance: number;
      };
      dry: {
        timeout: number;
        amount: {
          min: number;
          max: number;
        };
      };
    };

    type Gender = 'male' | 'female';

    type Plant = {
      coords: Vec3;
      gender: Gender;
      metadata: {
        stage: number;
        food: number;
        cutTime: number;
        growTime: number;
      };
    };

    type DBPlant = {
      id: number;
      coords: string;
      gender: Gender;
      stage: number;
      food: number;
      cut_time: number;
      grow_time: number;
    };
  }

  namespace Cornerselling {
    type Config = {
      sellableItems: Record<string, { value: number; reputation: number }>;
      decayTime: 10;
      cleanChance: 25;
      sellAmount: {
        min: number;
        max: number;
      };
      heatmapSize: number;
    };
  }

  namespace Blackmoney {
    type Config = {
      items: Record<string, { value: number }>;
    };
  }
}
