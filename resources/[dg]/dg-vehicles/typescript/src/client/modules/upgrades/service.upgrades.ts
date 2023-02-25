import { Notifications } from '@dgx/client';

import {
  cosmeticKeysToId,
  cosmeticUpgradeAppliers,
  getTyreSmokeIdFromColor,
  performanceKeysToId,
  wheelTypesPerClass,
} from './constants.upgrades';
import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';

export const getCosmeticUpgrades = (veh: number): Upgrades.Cosmetic | undefined => {
  if (!DoesEntityExist(veh)) {
    console.error('Cannot get cosmetic upgrades on non-exisiting vehicle');
    return;
  }
  SetVehicleModKit(veh, 0);

  let primaryColor: RGB | number;
  if (GetIsVehiclePrimaryColourCustom(veh)) {
    const [r, g, b] = GetVehicleCustomPrimaryColour(veh);
    primaryColor = { r, g, b };
  } else {
    primaryColor = GetVehicleColours(veh)[0];
  }

  let secondaryColor: RGB | number;
  if (GetIsVehicleSecondaryColourCustom(veh)) {
    const [r, g, b] = GetVehicleCustomSecondaryColour(veh);
    secondaryColor = { r, g, b };
  } else {
    secondaryColor = GetVehicleColours(veh)[1];
  }

  const tyreSmokeColors: number[] = GetVehicleTyreSmokeColor(veh);
  const neonColors: number[] = GetVehicleNeonLightsColour(veh);
  const [pearlescentColor, wheelColor] = GetVehicleExtraColours(veh);

  const upgrades: Partial<Record<keyof Upgrades.Cosmetic, number>> = {};
  (Object.keys(cosmeticKeysToId) as (keyof Upgrades.CosmeticModIds)[]).forEach(k => {
    upgrades[k] = GetVehicleMod(veh, cosmeticKeysToId[k]);
  });

  return {
    ...upgrades,
    tyreSmokeColor: !IsToggleModOn(veh, 20)
      ? -1
      : getTyreSmokeIdFromColor({ r: tyreSmokeColors[0], g: tyreSmokeColors[1], b: tyreSmokeColors[2] }),
    xenon: {
      active: IsToggleModOn(veh, 22),
      color: GetVehicleXenonLightsColor(veh),
    },
    wheels: {
      id: GetVehicleMod(veh, 23),
      custom: GetVehicleModVariation(veh, 23),
      type: GetVehicleWheelType(veh),
    },
    neon: {
      enabled: [0, 1, 2, 3].map(id => ({ id, toggled: IsVehicleNeonLightEnabled(veh, id) })),
      color: {
        r: neonColors[0],
        g: neonColors[1],
        b: neonColors[2],
      },
    },
    primaryColor: primaryColor,
    secondaryColor: secondaryColor,
    interiorColor: GetVehicleInteriorColor(veh),
    dashboardColor: GetVehicleDashboardColour(veh),
    pearlescentColor: pearlescentColor,
    wheelColor: wheelColor,
    extras: [...Array(14)].reduce<Upgrades.Cosmetic['extras']>((extras, _, i) => {
      const id = i + 1; // Extras are 1 indexed
      if (!DoesExtraExist(veh, id)) return extras;
      //@ts-ignore Returns 0 or 1, not boolean
      const enabled = IsVehicleExtraTurnedOn(veh, id) === 1;
      extras.push({ id, enabled });
      return extras;
    }, []),
    livery: GetVehicleLiveryCount(veh) == -1 ? GetVehicleMod(veh, 48) : GetVehicleLivery(veh) - 1,
    plateColor: GetVehicleNumberPlateTextIndex(veh),
    windowTint: GetVehicleWindowTint(veh),
  } as Upgrades.Cosmetic;
};

export const getPerformanceUpgrades = (veh: number): Upgrades.Performance | undefined => {
  if (!DoesEntityExist(veh)) {
    console.error('Cannot get performance upgrades on non-exisiting vehicle');
    return;
  }
  SetVehicleModKit(veh, 0);
  const upgrades: Partial<Record<keyof Upgrades.Performance, number>> = {};
  Object.entries(performanceKeysToId).forEach(([key, id]) => {
    upgrades[key as keyof Upgrades.Performance] = GetVehicleMod(veh, id);
  });
  return {
    ...upgrades,
    //@ts-ignore
    turbo: IsToggleModOn(veh, 18) === 1,
  } as Upgrades.Performance;
};

export const applyUpgrade = <T extends keyof Upgrades.Cosmetic, R extends keyof Upgrades.Performance>(
  veh: number,
  key: T | R,
  value: DeepPartial<Upgrades.Cosmetic[T] | Upgrades.Performance[R]>
) => {
  if (!DoesEntityExist(veh)) {
    console.error('Cannot apply upgrade on non-exisiting vehicle');
    return;
  }
  SetVehicleModKit(veh, 0);
  if (Object.keys(cosmeticKeysToId).includes(key)) {
    SetVehicleMod(veh, cosmeticKeysToId[key as keyof Upgrades.CosmeticModIds], value as number, false);
    return;
  }
  if (Object.keys(performanceKeysToId).includes(key)) {
    const modId = performanceKeysToId[key as keyof Upgrades.Performance];
    if (!modId) return;
    SetVehicleMod(veh, modId, value as number, false);
    return;
  }
  if (key === 'turbo') {
    ToggleVehicleMod(veh, 18, value as boolean);
    return;
  }
  if (!(key in cosmeticUpgradeAppliers)) {
    throw new Error(`[UPGRADES] ${key} is a invalid upgrade type`);
  }
  cosmeticUpgradeAppliers[key as T]!(veh, value as any);
};

export const applyUpgrades = (veh: number, upgrades: Partial<Upgrades.All>) => {
  // Assign the VehicleMods by Id
  Object.entries(upgrades).forEach(([key, data]) => {
    applyUpgrade(veh, key as keyof Upgrades.All, data);
  });
};

export const getCosmeticUpgradePossibilities = (veh: number): Upgrades.MaxedCosmetic | undefined => {
  if (!DoesEntityExist(veh)) {
    console.error('Cannot get cosmetic upgrade possibilities on non-exisiting vehicle');
    return;
  }
  SetVehicleModKit(veh, 0);
  const maxVehicleModIds: Record<string, number> = {};
  Object.entries(cosmeticKeysToId).forEach(([key, data]) => {
    maxVehicleModIds[key] = GetNumVehicleMods(veh, data);
  });
  return {
    ...(maxVehicleModIds as Record<keyof Upgrades.CosmeticModIds, number>),
    wheels: getWheelPossibilities(veh),
    extras: [...Array(14)].reduce((amount, _, i) => {
      if (!DoesExtraExist(veh, i + 1)) return amount;
      return amount + 1;
    }, 0),
    livery: GetVehicleLiveryCount(veh) !== -1 ? GetVehicleLiveryCount(veh) : GetNumVehicleMods(veh, 48),
    // https://docs.fivem.net/natives/?_0x9088EB5A43FFB0A1
    plateColor: 5,
  };
};

export const getPerformanceUpgradePossibilities = (veh: number): Upgrades.Performance | undefined => {
  if (!DoesEntityExist(veh)) {
    console.error('Cannot get performance upgrade possibilities on non-exisiting vehicle');
    return;
  }
  SetVehicleModKit(veh, 0);
  const maxVehicleModIds: Record<string, number> = {};
  Object.entries(performanceKeysToId).forEach(([key, data]) => {
    maxVehicleModIds[key] = GetNumVehicleMods(veh, data);
  });
  return {
    ...(maxVehicleModIds as Record<keyof typeof performanceKeysToId, number>),
    turbo: true,
  };
};

const getWheelPossibilities = (veh: number) => {
  const originalType = GetVehicleWheelType(veh);
  let ids = wheelTypesPerClass.normal;
  if (originalType === 6) {
    ids = wheelTypesPerClass.motorcycle;
  } else if (originalType === 10) {
    ids = wheelTypesPerClass.openwheel;
  }
  const possibilities = ids.reduce<Record<number, number>>((acc, catId) => {
    SetVehicleWheelType(veh, catId);
    acc[catId] = GetNumVehicleMods(veh, 23);
    return acc;
  }, {});
  SetVehicleWheelType(veh, originalType);
  return possibilities;
};

export const checkIllegalTunes = (vehicle: number) => {
  // Validation not required because if it does not have a vin already neither would it have any upgrades
  const vin = getVehicleVinWithoutValidation(vehicle);
  if (!vin) {
    Notifications.add('Kon voertuig niet checken', 'error');
    return;
  }
  const maxUpgrades = getPerformanceUpgradePossibilities(vehicle);
  const upgrades = getPerformanceUpgrades(vehicle);
  if (!upgrades || !maxUpgrades) {
    Notifications.add('Kon upgrades niet vinden', 'error');
    return;
  }
  let isLegal = true;
  for (const key of Object.keys(upgrades) as (keyof Upgrades.Performance)[]) {
    const maxValue = typeof maxUpgrades[key] === 'boolean' ? 1 : (maxUpgrades[key] as number) - 1;
    // we check max value, for example a motorcycle max susp is 0 so max legal is would be -1 which would cause it to always be marked as illegal
    if (maxValue < 0) continue;

    const curValue =
      typeof upgrades[key] === 'boolean' ? ((upgrades[key] as boolean) === true ? 1 : 0) : (upgrades[key] as number);
    if (curValue >= maxValue) {
      isLegal = false;
      break;
    }
  }
  Notifications.add(`Dit voertuig is ${isLegal ? 'NIET' : ''} illegaal getuned`, isLegal ? 'success' : 'error');
};
