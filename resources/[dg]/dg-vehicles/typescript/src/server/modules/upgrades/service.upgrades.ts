import { Config, Financials, Inventory, Util } from '@dgx/server';
import { getVehicleCosmeticUpgrades, updateVehicleUpgrades } from 'db/repository';
import bennysManager from 'modules/bennys/classes/BennysManager';
import vinManager from 'modules/identification/classes/vinmanager';
import { getConfigByEntity } from 'modules/info/service.info';

import { serverConfig } from '../../../config';

import { tuneCategories } from './constants.upgrades';
import { upgradesLogger } from './logger.upgrades';

let upgradePrices: Config.Prices;

const seedPrices = () => {
  upgradePrices = Config.getConfigValue<Config.Prices>('vehicles.upgradeprices');
};

// Get cosmetic from db, initialize data if none was found in db
export const getCosmetic = async (vin: string): Promise<Upgrades.Cosmetic | void> => {
  let currentUpgrades = await getVehicleCosmeticUpgrades(vin);
  if (currentUpgrades === null) {
    const netId = vinManager.getNetId(vin);
    if (!netId) return;
    currentUpgrades = await getCosmeticUpgradesForVeh(netId);
    if (!currentUpgrades) {
      throw new Error('Failed to get cosmetic upgrades of vehicle');
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

export const getPerformance = async (vin: string): Promise<Upgrades.Performance> => {
  const items = await Inventory.getItemsInInventory('tunes', vin);
  const names = items.map(item => item.name);
  let upgrades: Upgrades.Performance = {
    armor: -1,
    brakes: -1,
    engine: -1,
    transmission: -1,
    turbo: false,
    suspension: -1,
  };
  names.forEach(name => {
    const substrings = name.split('_');
    if (substrings[0] !== 'tune') {
      upgradesLogger.warn(`Item in tunes inventory (${vin}) is not a tune`);
      return;
    }
    const catName = substrings[1];
    const stage = Number(substrings[3]) - 1;
    const data = tuneCategories.find(data => data.name === catName);
    if (!data) {
      upgradesLogger.error(`Could not find category data of tune item`);
      return;
    }
    // amount is one for toggle mods like turbo
    if (data.amount === 1) {
      upgrades = { ...upgrades, [data.name]: true };
    } else {
      if ((upgrades[data.name] as number) >= stage) return;
      upgrades = { ...upgrades, [data.name]: stage };
    }
  });
  return upgrades;
};

export const saveCosmeticUpgrades = async (vin: string, newUpgrades?: Partial<Upgrades.Cosmetic>) => {
  const currentUpgrades = await getCosmetic(vin);
  if (!currentUpgrades) {
    upgradesLogger.error(`Could not get cosmetic upgrades for vehicle ${vin}`);
    return;
  }
  await updateVehicleUpgrades(vin, { ...currentUpgrades, ...newUpgrades });
  upgradesLogger.info(`Saved cosmetic upgrades for vehicle ${vin}`);
  Util.Log(
    'vehicles:updateUpgrades',
    {
      vin: vin,
      newUpgrades,
    },
    `Upgrades for vehicle (${vin}) have been updated`
  );
};

export const applyUpgrades = async (vin: string) => {
  const cosmeticUpgrades = (await getCosmetic(vin)) ?? {};
  const performanceUpgrades = await getPerformance(vin);
  const netId = vinManager.getNetId(vin);
  if (!netId) return;
  applyUpgradesToVeh(netId, { ...cosmeticUpgrades, ...performanceUpgrades });
};

export const getUpgradePrices = (veh: number) => {
  if (!upgradePrices) {
    seedPrices();
  }
  const vehClass = getConfigByEntity(veh)?.class;
  if (!vehClass) {
    upgradesLogger.error(
      `Could not get class of vehicle | entity: ${veh} | netId: ${NetworkGetNetworkIdFromEntity(veh)}`
    );
    return;
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

export const getPriceForUpgrades = (veh: number, upgrades: Partial<Upgrades.Cosmetic>) => {
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
      price += prices[upgrade as keyof Upgrades.AllCosmeticModIds] ?? 0;
    }
  }
  return price;
};

export const getCosmeticUpgradesForVeh = (netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  return Util.sendRPCtoEntityOwner<Upgrades.Cosmetic>(entity, 'vehicles:upgrades:getCosmetic', netId);
};

export const applyUpgradesToVeh = (netId: number, upgrades: Partial<Upgrades.All>) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  Util.sendEventToEntityOwner(entity, 'vehicles:upgrades:apply', netId, upgrades);
};
