import { Config, Financials, Inventory, Util } from '@dgx/server';
import { getVehicleCosmeticUpgrades, updateVehicleUpgrades } from 'db/repository';
import bennysManager from 'modules/bennys/classes/BennysManager';
import vinManager from 'modules/identification/classes/vinmanager';
import { getConfigByEntity } from 'modules/info/service.info';

import { serverConfig } from '../../../config';

import { upgradesLogger } from './logger.upgrades';
import { cosmeticKeysToId, TUNE_PARTS } from '../../../shared/upgrades/constants.upgrades';

let upgradePrices: Config.Prices;

const seedPrices = () => {
  upgradePrices = Config.getConfigValue<Config.Prices>('vehicles.upgradeprices');
};

/**
 * Get cosmetic from db, initialize data if none was found in db. NOTE: vehicle needs to exist!
 */
export const getCosmetic = async (vin: string): Promise<Vehicles.Upgrades.Cosmetic | undefined> => {
  let currentUpgrades = await getVehicleCosmeticUpgrades(vin);
  if (currentUpgrades === null) {
    const netId = vinManager.getNetId(vin);
    if (!netId) return;
    currentUpgrades = await getCosmeticUpgradesForVeh(netId);
    if (!currentUpgrades) {
      throw new Error('Failed to get cosmetic upgrades of vehicle');
    }
    if (!vinManager.isVinFromPlayerVeh(vin)) {
      return currentUpgrades;
    }
    await updateVehicleUpgrades(vin, currentUpgrades);
    upgradesLogger.info(`Initialized cosmetic upgrades for vehicle ${vin}`);
    Util.Log(
      'vehicles:initializeUpgrades',
      {
        vin: vin,
        upgrades: currentUpgrades,
      },
      `Upgrades for vehicle (${vin}) have been initialized`
    );
  }
  return currentUpgrades;
};

/**
 * Build performance updates from items in inventory. NOTE: vehicle needs to exist!
 */
export const getPerformance = async (vin: string): Promise<Vehicles.Upgrades.Performance | undefined> => {
  const netId = vinManager.getNetId(vin);
  if (!netId) return;

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const vehicleConfig = getConfigByEntity(vehicle);
  if (!vehicleConfig) return;

  const upgrades: Vehicles.Upgrades.Performance = {
    armor: -1,
    brakes: -1,
    engine: -1,
    transmission: -1,
    turbo: false,
    suspension: -1,
  };

  const items = await Inventory.getItemsInInventory('tunes', vin);
  for (const item of items) {
    if (item.metadata.class !== vehicleConfig.class) continue;

    // stage 1 translates to 0 for native status
    const stage = +(item.metadata.stage ?? 0) - 1;

    for (const [part, data] of Object.entries(TUNE_PARTS)) {
      if (data.itemName !== item.name) continue;

      // honestly dont know how to type this
      if (data.amount === 1) {
        //@ts-ignore
        upgrades[part as Vehicles.Upgrades.Tune] = true;
      } else {
        if ((upgrades[part as Vehicles.Upgrades.Tune] as number) < stage) {
          //@ts-ignore
          upgrades[part as Vehicles.Upgrades.Tune] = stage;
        }
      }
    }
  }

  return upgrades;
};

export const saveCosmeticUpgrades = async (vin: string, newUpgrades?: Partial<Vehicles.Upgrades.Cosmetic>) => {
  if (!vinManager.isVinFromPlayerVeh(vin)) {
    upgradesLogger.debug(`Skipped saving cosmetic upgrades for non-player vehicle ${vin}`);
    return;
  }
  const currentUpgrades = await getCosmetic(vin);
  if (!currentUpgrades) {
    upgradesLogger.error(`Could not get cosmetic upgrades for vehicle ${vin}`);
    return;
  }
  await updateVehicleUpgrades(vin, { ...currentUpgrades, ...newUpgrades });
  upgradesLogger.info(`Saved cosmetic upgrades for vehicle ${vin}`);
  Util.Log(
    'vehicles:upgrades:cosmetic',
    {
      vin: vin,
      newUpgrades,
    },
    `Upgrades for vehicle (${vin}) have been updated`
  );
};

export const applyUpgrades = async (vin: string, extraUpgrades: Partial<Vehicles.Upgrades.All> = {}) => {
  const netId = vinManager.getNetId(vin);
  if (!netId) return;

  const cosmeticUpgrades = await getCosmetic(vin);
  const performanceUpgrades = await getPerformance(vin);
  applyUpgradesToVeh(netId, { ...cosmeticUpgrades, ...performanceUpgrades, ...extraUpgrades });
};

export const getUpgradePrices = (veh: number) => {
  if (!upgradePrices) {
    seedPrices();
  }
  let vehClass = getConfigByEntity(veh)?.class;
  // Default to D class so bennys does not throw errors if model is not in config
  if (!vehClass) {
    vehClass = 'D';
  }
  const isVehInNoChargeSpot = bennysManager.isVehInNoChargeSpot(veh);
  const priceModifier = upgradePrices.classMultiplier[vehClass] ?? 1;
  const prices = Object.entries(upgradePrices.categories).reduce<Partial<Config.PriceCategory>>(
    (acc, [category, price]) => {
      if (isVehInNoChargeSpot) {
        acc[category as keyof Config.PriceCategory] = 0;
      } else {
        const priceWithoutTax = price * priceModifier;
        const priceWithTax = Financials.getTaxedPrice(priceWithoutTax, serverConfig.bennys.taxId).taxPrice;
        acc[category as keyof Config.PriceCategory] = priceWithTax;
      }
      return acc;
    },
    {}
  );

  return prices;
};

export const getPriceForUpgrades = (veh: number, upgrades: Partial<Vehicles.Upgrades.Cosmetic>) => {
  const prices = getUpgradePrices(veh);
  if (prices === undefined) {
    upgradesLogger.error(
      `Failed to get prices for vehicle | veh: ${veh} | netId: ${NetworkGetNetworkIdFromEntity(veh)}`
    );
    return 0;
  }
  let price = 0;
  for (const upgrade in upgrades) {
    if (upgrade === 'extras') {
      const enabledExtras = upgrades[upgrade]?.filter(e => e.enabled).length ?? 0;
      price += (prices?.extras ?? 0) * enabledExtras;
    } else {
      price += prices[upgrade as keyof Vehicles.Upgrades.AllCosmeticModIds] ?? 0;
    }
  }
  return price;
};

export const getCosmeticUpgradesForVeh = (netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  return Util.sendRPCtoEntityOwner<Vehicles.Upgrades.Cosmetic>(entity, 'vehicles:upgrades:getCosmetic', netId);
};

export const applyUpgradesToVeh = (netId: number, upgrades: Partial<Vehicles.Upgrades.All>) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  Util.sendEventToEntityOwner(entity, 'vehicles:upgrades:apply', netId, upgrades);
};

export const generateBaseUpgrades = (ent?: number): Vehicles.Upgrades.Cosmetic => {
  const [prim, sec] = ent ? GetVehicleColours(ent) : [0, 0];
  const [pearlescentColor, wheelColor] = ent ? GetVehicleExtraColours(ent) : [0, 0];
  const idUpgrades: Partial<Record<keyof Vehicles.Upgrades.Cosmetic, number>> = {};
  (Object.keys(cosmeticKeysToId) as (keyof Vehicles.Upgrades.CosmeticModIds)[]).forEach(k => {
    idUpgrades[k] = -1;
  });
  return {
    ...idUpgrades,
    xenon: {
      active: false,
      color: -1,
    },
    tyreSmokeColor: -1,
    wheels: {
      id: -1,
      custom: false,
      type: ent && DoesEntityExist(ent) ? GetVehicleWheelType(ent) : 0,
    },
    neon: {
      enabled: [0, 1, 2, 3].map(id => ({ id, toggled: false })),
      color: {
        r: 255,
        g: 0,
        b: 255,
      },
    },
    primaryColor: prim,
    secondaryColor: sec,
    interiorColor: ent ? GetVehicleInteriorColour(ent) : 0,
    dashboardColor: ent ? GetVehicleDashboardColour(ent) : 0,
    pearlescentColor,
    wheelColor,
    extras: [...Array(14)].map((_, i) => ({
      id: i + 1,
      enabled: false,
    })),
    livery: -1,
    plateColor: ent ? GetVehicleNumberPlateTextIndex(ent) : 0,
    windowTint: 0,
  } as Vehicles.Upgrades.Cosmetic;
};
