declare namespace Criminal {
  type Config = {
    weed: Weed.Config;
    cornerselling: Cornerselling.Config;
    blackmoney: Blackmoney.Config;
    fence: Fence.Config;
  };

  namespace Weed {
    type Config = {
      food: {
        decayTime: number;
        amount: {
          normal: number;
          deluxe: number;
        };
      };
      growTime: number;
      cut: {
        timeout: number;
        breakChance: number;
      };
      fertilizerDecrease: number;
      destroyMailChance: number;
    };

    type Gender = 'male' | 'female';
    type Stage = 0 | 1 | 2 | 3;

    type DBPlant = {
      id: number;
      coords: string;
      rotation: string;
      gender: Gender;
      stage: Stage;
      food: number;
      cut_time: number;
      grow_time: number;
      cid: number | null;
    };
  }

  namespace Cornerselling {
    type Config = {
      sellableItems: Record<string, { basePrice: number; requiredReputation: number }>;
      decayTime: number;
      cleanChance: number;
      sellAmount: {
        min: number;
        max: number;
      };
      maxModifier: number;
    };
  }

  namespace Blackmoney {
    type Config = {
      items: Record<string, { value: number }>;
    };
  }

  namespace Fence {
    type Config = {
      items: Record<string, number>;
    };
  }
}
