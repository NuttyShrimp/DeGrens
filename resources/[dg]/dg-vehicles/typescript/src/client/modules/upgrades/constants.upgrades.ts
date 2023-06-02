import { cosmeticKeysToId } from '../../../shared/upgrades/constants.upgrades';
// Small hack to prevent to replace all the imports
export { cosmeticKeysToId } from '../../../shared/upgrades/constants.upgrades';

export const allCosmeticKeysToId: Record<keyof Vehicles.Upgrades.AllCosmeticModIds, number> = {
  ...cosmeticKeysToId,
  tyreSmokeColor: 20,
  wheels: 23,
  livery: 48,
};

export const performanceKeysToId: Partial<Record<keyof Vehicles.Upgrades.Performance, number>> = {
  armor: 16,
  brakes: 12,
  engine: 11,
  transmission: 13,
  suspension: 15,
};

export const modKeysToId: Partial<Record<keyof (Vehicles.Upgrades.Performance | Vehicles.Upgrades.Cosmetic), number>> =
  {
    ...performanceKeysToId,
    ...cosmeticKeysToId,
  };

export const tyreSmokeColors: RGB[] = [
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

export const getTyreSmokeIdFromColor = (color: RGB) => {
  return tyreSmokeColors.findIndex(c => c.r === color.r && c.g === color.g && c.b === color.b);
};

export const cosmeticUpgradeAppliers: Partial<{
  [K in keyof Vehicles.Upgrades.Cosmetic]: Vehicles.Upgrades.CosmeticUpgradeApplier<K>;
}> = {
  wheels: (veh, val) => {
    const wheelData = val as Vehicles.Upgrades.Cosmetic['wheels'];
    SetVehicleWheelType(veh, wheelData.type);
    SetVehicleMod(veh, 23, wheelData.id, wheelData.custom);
    // Set backwheels for motorcycles
    if (GetVehicleClass(veh) === 8) {
      SetVehicleMod(veh, 24, wheelData.id, wheelData.custom);
    }
  },
  interiorColor: (veh, val) => {
    SetVehicleInteriorColor(veh, val);
  },
  dashboardColor: (veh, val) => {
    SetVehicleDashboardColour(veh, val);
  },
  primaryColor: (veh, val) => {
    const originalSecondary = GetVehicleColours(veh)[1];

    if (typeof val === 'number') {
      if (GetIsVehiclePrimaryColourCustom(veh)) ClearVehicleCustomPrimaryColour(veh);
      SetVehicleColours(veh, val, originalSecondary);
    } else {
      SetVehicleColours(veh, 0, originalSecondary); // Otherwise the custom color will be same type as normal for example matte or metal
      const rgb = val as RGB;
      SetVehicleCustomPrimaryColour(veh, rgb.r, rgb.g, rgb.b);
    }
  },
  secondaryColor: (veh, val) => {
    const originalPrimary = GetVehicleColours(veh)[0];

    if (typeof val === 'number') {
      if (GetIsVehicleSecondaryColourCustom(veh)) ClearVehicleCustomSecondaryColour(veh);
      SetVehicleColours(veh, originalPrimary, val);
    } else {
      SetVehicleColours(veh, originalPrimary, 0); // Otherwise the custom color will be same type as normal for example matte or metal
      const rgb = val as RGB;
      SetVehicleCustomSecondaryColour(veh, rgb.r, rgb.g, rgb.b);
    }
  },
  pearlescentColor: (veh, val) => {
    const wheelColor = GetVehicleExtraColours(veh)[1];
    SetVehicleExtraColours(veh, val, wheelColor);
  },
  wheelColor: (veh, val) => {
    const [pearlescentColor] = GetVehicleExtraColours(veh);
    SetVehicleExtraColours(veh, pearlescentColor, val);
  },
  extras: (veh, val) => {
    (val || []).forEach(extra => {
      if (!extra?.id || !DoesExtraExist(veh, extra.id)) return;
      //@ts-ignore Needs 0 or 1, not boolean
      SetVehicleExtra(veh, extra.id, !!extra.enabled ? 0 : 1);
    });
  },
  livery: (veh, livId) => {
    if (GetVehicleLiveryCount(veh) === -1) {
      SetVehicleMod(veh, 48, livId, false);
    } else {
      // These type of liveries are 0 indexed compared to normale mods which are -1 indexed
      SetVehicleLivery(veh, livId + 1);
    }
  },
  neon: (veh, val) => {
    if (val.enabled !== undefined) {
      Object.values(val.enabled as Vehicles.Upgrades.Cosmetic['neon']['enabled']).forEach(({ id, toggled }) => {
        SetVehicleNeonLightEnabled(veh, id, toggled);
      });
    }
    if (val.color !== undefined) {
      const rgb = val.color as RGB;
      SetVehicleNeonLightsColour(veh, rgb.r, rgb.g, rgb.b);
    }
  },
  plateColor: (veh, color) => {
    SetVehicleNumberPlateTextIndex(veh, color);
  },
  tyreSmokeColor: (veh, val) => {
    if (val === -1) {
      ToggleVehicleMod(veh, 20, false);
    } else {
      ToggleVehicleMod(veh, 20, true);
      const color = tyreSmokeColors[val];
      SetVehicleTyreSmokeColor(veh, color.r, color.g, color.b);
    }
  },
  xenon: (veh, val) => {
    if (val.active !== undefined) {
      ToggleVehicleMod(veh, 22, val.active);
    }
    if (val.color !== undefined) {
      SetVehicleXenonLightsColor(veh, val.color);
    }
  },
  windowTint: (veh, val) => {
    SetVehicleWindowTint(veh, val);
  },
};

export const wheelTypesPerClass: Record<string, number[]> = {
  normal: [0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12],
  motorcycle: [6],
  openwheel: [10],
};
