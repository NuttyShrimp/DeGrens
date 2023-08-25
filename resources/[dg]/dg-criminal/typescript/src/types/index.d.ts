declare namespace Criminal {
  type Config = {
    weed: Weed.Config;
    cornerselling: Cornerselling.Config;
    blackmoney: Blackmoney.Config;
    fence: Fence.Config;
    atm: ATM.Config;
    oxyrun: Oxyrun.Config;
    parkingmeters: Parkingmeters.Config;
    methrun: Methrun.Config;
    banktruck: Banktruck.Config;
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

  namespace Parkingmeters {
    type Config = {
      models: string[];
      policeCallChance: number;
      loot: [min: number, max: number];
      lockpickQualityDecrease: number;
    };
  }

  namespace Methrun {
    type Config = {
      initialPayment: {
        crypto: string;
        amount: number;
      };
      delayAfterDropOff: number; // seconds
      amountOfGuards: number;
      trackerTime: number; // minutes
      pricePercentage: number; // percentage you get per bag compared to when cornerselling
      timeoutBetweenRuns: number; // minutes
      vehicleModels: string[];
      finishLocations: Vec4[];
      dropOffLocations: Vec4[];
      vehicleLocations: {
        spawn: Vec4;
        guards: Vec4[];
        zone: Vec2[];
      }[];
    };

    type ActiveRun = {
      startCID: number;
      finishLocation: Config['finishLocations'][number];
      dropOffLocation: Config['dropOffLocations'][number];
      vehicleLocation: Config['vehicleLocations'][number];
      methAmount: number;
      itemId: string | null;
      playersInVehicleZone: Map<number>;
      vehicle: {
        vehicle: number | null;
        vin: string | null;
        trackerId: number | null;
      };
      guards: {
        amountLeftToSpawn: number;
        amountLeftToKill: number;
        interval: NodeJS.Timer | null;
      };
      state: {
        dropOffFinished: boolean;
        vehicleZoneBuilt: boolean;
        vehicleSpawned: boolean;
        vehicleLockpicked: boolean;
        trackerRemoved: boolean;
      };
    };
  }

  namespace Banktruck {
    type Config = {
      amountOfGuards: number;
      hack: {
        gridSize: number;
        time: number;
      };
      openingDelay: number; // seconds between hack finish and door opening
      loot: {
        timePerBag: number; // seconds between receiving bag
        bagAmount: [number, number];
      };
      startChance: number; // chance of actually starting activity when all other checks are passed
      scheduleInterval: number; // minutes between start schedule checks
      timeout: number; // minutes to become available again after finishing
      locations: LocationConfig[];
    };

    type LocationConfig = {
      vehicle: Vec4;
      guards: Vec4[];
    };

    type Active = {
      locationIdx: number;
      vehicle: number;
      state: Criminal.Banktruck.State;
      lootRemaining: number;
    };

    type State = {
      hackingPlayer: number | null;
      opening: boolean;
      open: boolean;
      guardsSpawned: boolean;
      looting: boolean;
    };
  }
}
