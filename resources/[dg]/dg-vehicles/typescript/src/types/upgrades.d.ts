/**
 * Ids with number as result are received with GetVehicleMod
 * Ids with boolean as result are received with IsToggleModOn
 */

declare namespace Upgrades {
  type CosmeticUpgradeApplier<T extends keyof Cosmetic> = (
    veh: number,
    value: DeepPartial<Upgrades.Cosmetic[T]>
  ) => void;

  type Tune = keyof Omit<Performance, 'armor'>;

  interface Performance {
    // id = 16
    armor: number;
    // id = 12
    brakes: number;
    // id = 11
    engine: number;
    // id = 13
    transmission: number;
    // id = 18
    turbo: boolean;
    // id = 15
    suspension: number;
  }

  interface CosmeticModIds {
    // id = 0
    spoiler: number;
    // id = 1
    frontBumper: number;
    // id = 2
    rearBumper: number;
    // id = 3
    sideSkirt: number;
    // id = 4
    exhaust: number;
    // id = 5
    frame: number;
    // id = 6
    grille: number;
    // id = 7
    hood: number;
    // id = 8
    leftFenders: number;
    // id = 9
    rightFenders: number;
    // id = 10
    roof: number;
    // id = 14
    horn: number;
    // id = 19
    subwoofer: number;
    // id = 25
    plateHolder: number;
    // id = 26
    vanityPlate: number;
    // id = 27
    trimA: number;
    // id = 28
    ornaments: number;
    // id = 29
    dashboard: number;
    // id = 30
    dial: number;
    // id = 31
    doorSpeakers: number;
    // id = 32
    seats: number;
    // id = 33
    steeringWheel: number;
    // id = 34
    shiftLever: number;
    // id = 35
    plaques: number;
    // id = 36
    speakers: number;
    // id = 37
    trunk: number;
    // id = 44
    trimB: number;
    // id = 38
    engineHydraulics: number;
    // id = 39
    engineBlock: number;
    // id = 40
    airFilter: number;
    // id = 41
    struts: number;
    // id = 42
    archCover: number;
    // id = 43
    aerials: number;
    // id = 45
    tank: number;
    // id = 46
    // In core labeled as window, in native enum it is a door
    door: number;
  }

  interface AllCosmeticModIds extends CosmeticModIds {
    // id = 20
    tyreSmokeColor: number;
    // id = 23
    wheels: number;
    // id = 48
    livery: number;
  }

  interface Cosmetic extends CosmeticModIds {
    xenon: {
      // id = 22
      active: boolean;
      // Actual color is received with GetVehicleXenonLightsColour
      color: number;
    };
    // id = 23
    wheels: {
      id: number;
      // GetVehicleModVariation
      custom: boolean;
      type: number;
    };
    neon: {
      enabled: { id: number; toggled: boolean }[];
      // GetVehicleNeonLightsColour
      color: RGB;
    };
    // GetVehicleColours + colorIdToRGB
    primaryColor: RGB | number;
    secondaryColor: RGB | number;
    // GetVehicleInteriorColor
    interiorColor: number;
    // GetVehicleDashboardColor
    dashboardColor: number;
    // GetVehicleExtraColours
    pearlescentColor: number;
    wheelColor: number;
    extras: { id: number; enabled: boolean }[];
    // id = 48 or new native
    livery: number;
    // GetVehicleNumberPlateTextIndex
    plateColor: number;
    // id = 20
    tyreSmokeColor: number;
    // GetVehicleWindowTint
    windowTint: number;
  }

  type All = Cosmetic & Performance;

  type MaxedCosmetic = Omit<
    Cosmetic,
    | 'primaryColor'
    | 'secondaryColor'
    | 'interiorColor'
    | 'dashboardColor'
    | 'pearlescentColor'
    | 'wheelColor'
    | 'neon'
    | 'xenon'
    | 'tyreSmokeColor'
    | 'extras'
    | 'wheels'
    | 'windowTint'
  > & {
    extras: number;
    wheels: Record<number, number>;
  };
}
