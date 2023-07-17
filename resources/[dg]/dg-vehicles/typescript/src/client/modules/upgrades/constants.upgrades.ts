import {
  COSMETIC_KEYS_TO_ID,
  NORMAL_COSMETIC_KEYS_TO_ID,
  NORMAL_PERFORMANCE_KEYS_TO_ID,
  PERFORMANCE_KEYS_TO_ID,
} from '@shared/upgrades/constants.upgrades';

const TYRE_SMOKE_COLORS: RGB[] = [
  { r: 254, g: 254, b: 254 },
  { r: 1, g: 1, b: 1 },
  { r: 0, g: 150, b: 255 },
  { r: 255, g: 255, b: 50 },
  { r: 255, g: 153, b: 51 },
  { r: 255, g: 10, b: 10 },
  { r: 10, g: 255, b: 10 },
  { r: 153, g: 10, b: 153 },
  { r: 255, g: 102, b: 178 },
  { r: 128, g: 128, b: 128 },
];

const WHEEL_TYPES_PER_CLASS: Record<string, number[]> = {
  normal: [0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12],
  motorcycle: [6],
  openwheel: [10],
};

// this type carries the entire upgrades module
type UpgradesObj<T extends Vehicles.Upgrades.Key> = {
  [K in T]: {
    type: K extends Vehicles.Upgrades.Performance.Key ? 'performance' : 'cosmetic';
    get: (vehicle: number) => Vehicles.Upgrades.Upgrades[K];
    set: (
      vehicle: number,
      // allow only objects to be partial
      value: Vehicles.Upgrades.PartialValue<K>
    ) => void;
  } & (K extends keyof Vehicles.Upgrades.Amount ? { getAmount: (vehicle: number) => Vehicles.Upgrades.Amount[K] } : {});
};

export const UPGRADES: UpgradesObj<Vehicles.Upgrades.Key> = {
  // we generate all the data for cosmetic keys which use normal Get/Set-VehicleMod functions
  ...(Object.keys(NORMAL_COSMETIC_KEYS_TO_ID) as Vehicles.Upgrades.Cosmetic.NormalKey[]).reduce((acc, key) => {
    acc[key] = {
      type: 'cosmetic',
      get: vehicle => GetVehicleMod(vehicle, NORMAL_COSMETIC_KEYS_TO_ID[key]),
      set: (vehicle, value) => SetVehicleMod(vehicle, NORMAL_COSMETIC_KEYS_TO_ID[key], value, false),
      getAmount: vehicle => GetNumVehicleMods(vehicle, NORMAL_COSMETIC_KEYS_TO_ID[key]),
    };
    return acc;
  }, {} as UpgradesObj<Vehicles.Upgrades.Cosmetic.NormalKey>),
  primaryColor: {
    type: 'cosmetic',
    get: vehicle => {
      if (GetIsVehiclePrimaryColourCustom(vehicle)) {
        const [r, g, b] = GetVehicleCustomPrimaryColour(vehicle);
        return { r, g, b };
      } else {
        return GetVehicleColours(vehicle)[0];
      }
    },
    set: (vehicle, value) => {
      const originalSecondary = GetVehicleColours(vehicle)[1];
      if (typeof value === 'number') {
        if (GetIsVehiclePrimaryColourCustom(vehicle)) ClearVehicleCustomPrimaryColour(vehicle);
        SetVehicleColours(vehicle, value, originalSecondary);
      } else {
        SetVehicleColours(vehicle, 0, originalSecondary); // Otherwise the custom color will be same type as normal for example matte or metal
        SetVehicleCustomPrimaryColour(vehicle, value.r, value.g, value.b);
      }
    },
  },
  secondaryColor: {
    type: 'cosmetic',
    get: vehicle => {
      if (GetIsVehicleSecondaryColourCustom(vehicle)) {
        const [r, g, b] = GetVehicleCustomSecondaryColour(vehicle);
        return { r, g, b };
      } else {
        return GetVehicleColours(vehicle)[1];
      }
    },
    set: (vehicle, value) => {
      const originalPrimary = GetVehicleColours(vehicle)[0];
      if (typeof value === 'number') {
        if (GetIsVehicleSecondaryColourCustom(vehicle)) ClearVehicleCustomSecondaryColour(vehicle);
        SetVehicleColours(vehicle, originalPrimary, value);
      } else {
        SetVehicleColours(vehicle, originalPrimary, 0); // Otherwise the custom color will be same type as normal for example matte or metal
        SetVehicleCustomSecondaryColour(vehicle, value.r, value.g, value.b);
      }
    },
  },
  interiorColor: {
    type: 'cosmetic',
    get: GetVehicleInteriorColor,
    set: SetVehicleInteriorColor,
  },
  dashboardColor: {
    type: 'cosmetic',
    get: GetVehicleDashboardColour,
    set: SetVehicleDashboardColour,
  },
  pearlescentColor: {
    type: 'cosmetic',
    get: vehicle => GetVehicleExtraColours(vehicle)[0],
    set: (vehicle, value) => {
      const wheelColor = GetVehicleExtraColours(vehicle)[1];
      SetVehicleExtraColours(vehicle, value, wheelColor);
    },
  },
  wheelColor: {
    type: 'cosmetic',
    get: vehicle => GetVehicleExtraColours(vehicle)[1],
    set: (vehicle, value) => {
      const pearlescentColor = GetVehicleExtraColours(vehicle)[0];
      SetVehicleExtraColours(vehicle, pearlescentColor, value);
    },
  },
  tyreSmokeColor: {
    type: 'cosmetic',
    get: vehicle => {
      if (!IsToggleModOn(vehicle, COSMETIC_KEYS_TO_ID.tyreSmokeColor)) return -1;
      const colors = GetVehicleTyreSmokeColor(vehicle);
      return TYRE_SMOKE_COLORS.findIndex(c => c.r === colors[0] && c.g === colors[1] && c.b === colors[2]);
    },
    set: (vehicle, value) => {
      if (value === -1) {
        ToggleVehicleMod(vehicle, COSMETIC_KEYS_TO_ID.tyreSmokeColor, false);
      } else {
        ToggleVehicleMod(vehicle, COSMETIC_KEYS_TO_ID.tyreSmokeColor, true);
        const color = TYRE_SMOKE_COLORS[value];
        SetVehicleTyreSmokeColor(vehicle, color.r, color.g, color.b);
      }
    },
  },
  neon: {
    type: 'cosmetic',
    get: vehicle => {
      const colors = GetVehicleNeonLightsColour(vehicle);
      return {
        enabled: [0, 1, 2, 3].map(id => ({ id, toggled: IsVehicleNeonLightEnabled(vehicle, id) })),
        color: {
          r: colors[0],
          g: colors[1],
          b: colors[2],
        },
      };
    },
    set: (vehicle, value) => {
      if (value.enabled !== undefined) {
        Object.values(value.enabled).forEach(({ id, toggled }) => {
          SetVehicleNeonLightEnabled(vehicle, id, toggled);
        });
      }
      if (value.color !== undefined) {
        SetVehicleNeonLightsColour(vehicle, value.color.r, value.color.g, value.color.b);
      }
    },
  },
  xenon: {
    type: 'cosmetic',
    get: vehicle => ({
      active: IsToggleModOn(vehicle, 22),
      color: GetVehicleXenonLightsColor(vehicle),
    }),
    set: (vehicle, value) => {
      if (value.active !== undefined) {
        ToggleVehicleMod(vehicle, 22, value.active);
      }
      if (value.color !== undefined) {
        SetVehicleXenonLightsColor(vehicle, value.color);
      }
    },
  },
  plateColor: {
    type: 'cosmetic',
    get: GetVehicleNumberPlateTextIndex,
    set: SetVehicleNumberPlateTextIndex,
    getAmount: () => 5, // https://docs.fivem.net/natives/?_0x9088EB5A43FFB0A1
  },
  windowTint: {
    type: 'cosmetic',
    get: GetVehicleWindowTint,
    set: SetVehicleWindowTint,
  },
  livery: {
    type: 'cosmetic',
    get: vehicle =>
      GetVehicleLiveryCount(vehicle) == -1
        ? GetVehicleMod(vehicle, COSMETIC_KEYS_TO_ID.livery)
        : GetVehicleLivery(vehicle) - 1,
    set: (vehicle, value) => {
      if (GetVehicleLiveryCount(vehicle) === -1) {
        SetVehicleMod(vehicle, COSMETIC_KEYS_TO_ID.livery, value, false);
      } else {
        // These type of liveries are 0 indexed compared to normale mods which are -1 indexed
        SetVehicleLivery(vehicle, value + 1);
      }
    },
    getAmount: vehicle => {
      const liveryCount = GetVehicleLiveryCount(vehicle);
      if (liveryCount !== -1) return liveryCount;
      return GetNumVehicleMods(vehicle, COSMETIC_KEYS_TO_ID.livery);
    },
  },
  wheels: {
    type: 'cosmetic',
    get: vehicle => ({
      id: GetVehicleMod(vehicle, 23),
      custom: GetVehicleModVariation(vehicle, 23),
      type: GetVehicleWheelType(vehicle),
    }),
    set: (vehicle, value) => {
      if (value.id === undefined || value.type === undefined) {
        console.log(`Failed to provide id and/or type to set wheels: ${JSON.stringify(value)}`);
        return;
      }

      SetVehicleWheelType(vehicle, value.type);
      SetVehicleMod(vehicle, 23, value.id, value.custom ?? false);
      // Set backwheels for motorcycles
      if (GetVehicleClass(vehicle) === 8) {
        SetVehicleMod(vehicle, 24, value.id, value.custom ?? false);
      }
    },
    getAmount: vehicle => {
      const originalWheelUpgrade = UPGRADES.wheels.get(vehicle);

      let ids: number[];
      switch (GetVehicleClass(vehicle)) {
        case 8:
          ids = WHEEL_TYPES_PER_CLASS.motorcycle;
          break;
        case 22:
          ids = WHEEL_TYPES_PER_CLASS.openwheel;
          break;
        default:
          ids = WHEEL_TYPES_PER_CLASS.normal;
          break;
      }

      const possibilities = ids.reduce<Record<number, number>>((acc, catId) => {
        SetVehicleWheelType(vehicle, catId);
        acc[catId] = GetNumVehicleMods(vehicle, COSMETIC_KEYS_TO_ID.wheels);
        return acc;
      }, {});

      UPGRADES.wheels.set(vehicle, originalWheelUpgrade);
      return possibilities;
    },
  },
  extras: {
    type: 'cosmetic',
    get: vehicle => {
      const extras = [...Array(14)].reduce<Vehicles.Upgrades.Cosmetic.Upgrades['extras']>((extras, _, i) => {
        const id = i + 1; // Extras are 1 indexed
        if (!DoesExtraExist(vehicle, id)) return extras;
        const enabled = !!IsVehicleExtraTurnedOn(vehicle, id);
        extras.push({ id, enabled });
        return extras;
      }, []);
      return extras;
    },
    set: (vehicle, value) => {
      (value || []).forEach(extra => {
        if (!extra?.id || !DoesExtraExist(vehicle, extra.id)) return;
        SetVehicleExtra(vehicle, extra.id, (!!extra.enabled ? 0 : 1) as unknown as boolean);
      });
    },
    getAmount: vehicle => [...Array(14)].reduce((amount, _, i) => amount + (DoesExtraExist(vehicle, i + 1) ? 1 : 0), 0),
  },
  bulletProofTires: {
    type: 'performance',
    get: vehicle => !GetVehicleTyresCanBurst(vehicle),
    set: (vehicle, value) => SetVehicleTyresCanBurst(vehicle, !value),
    getAmount: () => true,
  },
  // we generate all the data for performance keys which use normal Get/Set-VehicleMod functions
  ...(Object.keys(NORMAL_PERFORMANCE_KEYS_TO_ID) as Vehicles.Upgrades.Performance.NormalKey[]).reduce((acc, key) => {
    acc[key] = {
      type: 'performance',
      get: vehicle => GetVehicleMod(vehicle, NORMAL_PERFORMANCE_KEYS_TO_ID[key]),
      set: (vehicle, value) => SetVehicleMod(vehicle, NORMAL_PERFORMANCE_KEYS_TO_ID[key], value, false),
      getAmount: vehicle => GetNumVehicleMods(vehicle, NORMAL_PERFORMANCE_KEYS_TO_ID[key]),
    };
    return acc;
  }, {} as UpgradesObj<Vehicles.Upgrades.Performance.NormalKey>),
  // all custom getter/setters for keys
  turbo: {
    type: 'performance',
    get: vehicle => !!IsToggleModOn(vehicle, PERFORMANCE_KEYS_TO_ID.turbo),
    set: (vehicle, value) => ToggleVehicleMod(vehicle, PERFORMANCE_KEYS_TO_ID.turbo, value),
    getAmount: () => true,
  },
};

const KEYS = Object.keys(UPGRADES) as Vehicles.Upgrades.Key[];

export const KEYS_BY_TYPE: Vehicles.Upgrades.TypeToKeys = {
  cosmetic: KEYS.filter(k => UPGRADES[k].type === 'cosmetic') as Vehicles.Upgrades.Cosmetic.Key[],
  performance: KEYS.filter(k => UPGRADES[k].type === 'performance') as Vehicles.Upgrades.Performance.Key[],
};

export const AMOUNT_KEYS = KEYS.filter(k => 'getAmount' in UPGRADES[k]) as Vehicles.Upgrades.AmountKey[];
