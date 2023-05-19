declare namespace Criminal {
  type Config = {
    weed: Weed.Config;
    cornerselling: Cornerselling.Config;
    blackmoney: Blackmoney.Config;
    fence: Fence.Config;
    atm: ATM.Config;
    oxyrun: Oxyrun.Config;
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
        maxTimes: number;
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
      times_cut: number;
      cid: number | null;
    };
  }

  namespace Cornerselling {
    type Config = {
      sellableItems: Record<
        string,
        {
          basePrice: number;
          requiredReputation: number;
          sellAmount: [number, number];
        }
      >;
      decayTime: number;
      maxModifier: number;
      modifierIncreasePerSale: number;
    };
  }

  namespace Blackmoney {
    type Config = {
      items: Record<string, Item>;
      originActions: Record<string, OriginAction>;
    };

    type Item = {
      value: number;
      maxItemsPerSale?: number;
    };

    type OriginAction = {
      chance: number;
      maxItemsAmount: number;
    };
  }

  namespace Fence {
    type Config = {
      items: Record<string, number>;
    };
  }

  namespace ATM {
    type Config = {
      whitelistedModels: string[];
      loot: {
        cash: [number, number];
        rolls: [number, number];
        specialItem: {
          pool: {
            item: string;
            amount: [number, number];
          }[];
          chance: number;
        };
      };
    };

    type Robbery = {
      vehicleNetId: number;
      atmData: AtmData;
    };

    type AtmData = {
      coords: Vec3;
      rotation: Vec3;
      model: number;
    };
  }

  namespace Oxyrun {
    type Config = {
      jobPayout: NonNullable<Jobs.Job['payout']>;
      receiveOxyChance: number;
      deliveriesPerRun: number;
      dispatchChance: number;
      locations: Location[];
    };

    type ActiveRun = {
      cid: number;
      locationId: number;
      currentVin: string | null;
      currentStep: 'pickup' | 'delivery';
      counter: number;
      payoutLevel: number;
    };

    type Location = {
      center: Vec3;
      width: number;
      length: number;
      options: {
        heading: number;
        minZ: number;
        maxZ: number;
      };
    };
  }
}
