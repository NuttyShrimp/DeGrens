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
      feedTime: number; // time in minutes player has to feed plant
      growTime: number; // time in minutes player has to wait after feeding time has finished
      fertilizerDecrease: number; // percentage of quality deducted from fertilizer when feeding
      idealWaterTime: number; // time in minutes after planting that the plant needs to be watered for 100% quality
      foodModifier: Record<FoodType, number>; // modifier on quality
    };

    type Gender = 'male' | 'female';
    type FoodType = 'none' | 'normal' | 'deluxe';

    type DBPlant = {
      id: number;
      coords: string;
      rotation: string;
      gender: Gender;
      plant_time: number;
      cid: number | null;
      food_type: FoodType;
      water_time: number;
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
