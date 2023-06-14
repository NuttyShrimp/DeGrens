declare namespace Vehicles {
  type SpawnVehicleFunction = (data: {
    model: string;
    position: Vec3 | Vec4;
    vin?: string;
    plate?: string;
    upgrades?: Partial<Vehicles.Upgrades.Upgrades>;
    fuel?: number;
    keys?: number;
    isFakePlate?: boolean;
    overrideStance?: Stances.Stance;
  }) => Promise<
    | {
        vehicle: number;
        netId: number;
        vin: string;
        plate: string;
      }
    | undefined
  >;

  type SpawnLocalVehicleFunction = (data: {
    model: string | number;
    position: Vec3 | Vec4;
    plate?: string;
    upgrades?: Partial<Vehicles.Upgrades.Upgrades>;
    invincible?: boolean;
    frozen?: boolean;
    doorLockState?: number;
    validateAfterModelLoad?: () => boolean; // this function will get called after the model has loaded, if it returns false, the vehicle will not be spawned. can be used to cancel spawning
  }) => Promise<vehicle | undefined>;

  declare namespace Upgrades {
    type Tune = Exclude<Performance.Key, 'armor'>;

    namespace Performance {
      /**
       *  Normal is ones that can be applyed using SetVehicleMod
       * */
      type NormalKey = 'armor' | 'brakes' | 'engine' | 'transmission' | 'suspension';

      // we use interface to properly override keys with custom type if they exist in NormalKey
      interface Upgrades extends Record<NormalKey, number> {
        turbo: boolean;
      }

      type Key = keyof Upgrades;
    }

    namespace Cosmetic {
      /**
       *  Normal is ones that can be applyed using SetVehicleMod
       * */
      type NormalKey =
        | 'spoiler'
        | 'frontBumper'
        | 'rearBumper'
        | 'sideSkirt'
        | 'exhaust'
        | 'frame'
        | 'grille'
        | 'hood'
        | 'leftFenders'
        | 'rightFenders'
        | 'roof'
        | 'horn'
        | 'subwoofer'
        | 'plateHolder'
        | 'vanityPlate'
        | 'trimA'
        | 'ornaments'
        | 'dashboard'
        | 'dial'
        | 'doorSpeakers'
        | 'seats'
        | 'steeringWheel'
        | 'shiftLever'
        | 'plaques'
        | 'speakers'
        | 'trunk'
        | 'trimB'
        | 'engineHydraulics'
        | 'engineBlock'
        | 'airFilter'
        | 'struts'
        | 'archCover'
        | 'aerials'
        | 'tank'
        | 'door';

      /**
       * Extended still have a SetVehicleMod id but have special getters/setters
       * does not matter if they use custom getter/setter data
       * */
      type ExtendedKey = NormalKey | 'tyreSmokeColor' | 'wheels' | 'livery' | 'xenon';

      // we use interface to properly override keys with custom type if they exist in NormalKey
      interface Upgrades extends Record<ExtendedKey, number> {
        xenon: {
          active: boolean;
          color: number;
        };
        wheels: {
          id: number;
          custom: boolean;
          type: number;
        };
        neon: {
          enabled: {
            id: number;
            toggled: boolean;
          }[];
          color: RGB;
        };
        primaryColor: RGB | number;
        secondaryColor: RGB | number;
        extras: {
          id: number;
          enabled: boolean;
        }[];
        interiorColor: number;
        dashboardColor: number;
        pearlescentColor: number;
        wheelColor: number;
        plateColor: number;
        windowTint: number;
      }

      type Key = keyof Upgrades;
    }

    type Upgrades = Cosmetic.Upgrades & Performance.Upgrades;
    type Key = Cosmetic.Key | Performance.Key;

    type PartialValue<T extends Key> = Upgrades[T] extends Record<string, any> ? Partial<Upgrades[T]> : Upgrades[T];

    type TypeToKeys = {
      cosmetic: Vehicles.Upgrades.Cosmetic.Key[];
      performance: Vehicles.Upgrades.Performance.Key[];
    };
    type Type = 'cosmetic' | 'performance';

    type Amount = Record<
      Exclude<
        Key,
        | 'primaryColor'
        | 'secondaryColor'
        | 'interiorColor'
        | 'dashboardColor'
        | 'pearlescentColor'
        | 'wheelColor'
        | 'neon'
        | 'xenon'
        | 'tyreSmokeColor'
        | 'wheels'
        | 'windowTint'
        | 'turbo'
        | 'extras'
      >,
      number
    > & {
      wheels: Record<number, number>;
      turbo: boolean;
    };

    type AmountKey = keyof Amount;

    namespace Prices {
      type Category = keyof AllCosmeticModIds | 'extras';
      type Prices = Record<Category, number>;

      type Config = {
        categories: CategoryPrices;
        classMultiplier: Record<CarClass, number>;
      };
    }
  }

  type ItemUpgrade = Extract<Upgrades.Key, 'neon' | 'xenon'>;

  declare namespace Handlings {
    type HandlingEntry =
      | 'fBrakeForce'
      | 'fBrakeBiasFront'
      | 'fClutchChangeRateScaleDownShift'
      | 'fClutchChangeRateScaleUpShift'
      | 'fCollisionDamageMult'
      | 'fDeformationDamageMult'
      | 'fDriveBiasFront'
      | 'fDriveInertia'
      | 'fEngineDamageMult'
      | 'fHandBrakeForce'
      | 'fInitialDragCoeff'
      | 'fInitialDriveForce'
      | 'fInitialDriveMaxFlatVel'
      | 'fLowSpeedTractionLossMult'
      | 'fSteeringLock'
      | 'fSuspensionCompDamp'
      | 'fSuspensionForce'
      | 'fSuspensionReboundDamp'
      | 'fTractionBiasFront'
      | 'fTractionCurveMax'
      | 'fTractionCurveMin'
      | 'fTractionLossMult';
    type Handling = Record<HandlingEntry, number>;

    type ModifierType = 'add' | 'multiplier' | 'fixed';

    type Multiplier = {
      value: number;
      type: ModifierType;
      // differantiate between nitro, vehicle modes, stall,...
      priority: number;
    };

    type Multipliers = Record<HandlingEntry, Record<string, Multiplier>>;
  }
}
