import { Util, Inventory, Financials, Config, TaxIds, Sync, SQL } from '@dgx/server';
import { TUNE_PARTS } from '@shared/upgrades/constants.upgrades';
import {
  generateBaseCosmeticUpgrades,
  generateBasePerformanceUpgrades,
  mergeUpgrades,
} from '@shared/upgrades/service.upgrades';
import { getVehicleCosmeticUpgrades } from 'db/repository';
import { getClassOfVehicleWithVin } from 'modules/identification/service.id';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { getConfigByModel } from 'modules/info/service.info';
import { STANDARD_EXTRA_UPGRADES } from '../constants.upgrades';

class UpgradesManager extends Util.Singleton<UpgradesManager>() {
  private readonly logger: winston.Logger;
  private pricesConfig!: Vehicles.Upgrades.Prices.Config;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'UpgradesManager' });
  }

  // make sure every player_vehicles has a row in vehicle_upgrades
  public validatePlayerVehicleUpgrades = async () => {
    const result = await SQL.query<{ vin: string }[]>(
      'SELECT pv.vin FROM player_vehicles AS pv LEFT JOIN vehicle_upgrades AS vu ON vu.vin = pv.vin WHERE vu.vin IS NULL'
    );
    if (!result) {
      this.logger.error('Failed to select player_vehicles without vehicle_upgrades');
      return;
    }

    if (result.length === 0) return;

    const baseCosmeticJSON = JSON.stringify(generateBaseCosmeticUpgrades());
    SQL.insertValues(
      'vehicle_upgrades',
      result.map(({ vin }) => ({ vin, cosmetic: baseCosmeticJSON }))
    );
  };

  public loadPrices = async () => {
    await Config.awaitConfigLoad();
    this.pricesConfig = Config.getConfigValue<Vehicles.Upgrades.Prices.Config>('vehicles.upgradeprices');
  };

  public getPricesForClass = (
    data:
      | {
          carClass: CarClass;
          includeTax: boolean;
        }
      | { free: true }
  ) => {
    if ('free' in data) {
      return (Object.keys(this.pricesConfig.categories) as Vehicles.Upgrades.Prices.Category[]).reduce(
        (prices, category) => {
          prices[category] = 0;
          return prices;
        },
        {} as Vehicles.Upgrades.Prices.Prices
      );
    }

    const classModifier = 'free' in data ? 0 : this.pricesConfig.classMultiplier[data.carClass] ?? 1;
    return (Object.entries(this.pricesConfig.categories) as [Vehicles.Upgrades.Prices.Category, number][]).reduce(
      (acc, [category, price]) => {
        const priceWithoutTax = price * classModifier;
        acc[category] = data.includeTax
          ? Financials.getTaxedPrice(priceWithoutTax, TaxIds.Goederen).taxPrice
          : priceWithoutTax;
        return acc;
      },
      {} as Vehicles.Upgrades.Prices.Prices
    );
  };

  public calculatePriceForUpgrades = (carClass: CarClass, upgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades>) => {
    const prices = this.getPricesForClass({ carClass, includeTax: false });
    let price = 0;
    for (const upgrade of Object.keys(upgrades) as Vehicles.Upgrades.Cosmetic.Key[]) {
      if (upgrade === 'extras') {
        const amountOfEnabledExtras = upgrades.extras?.filter(e => e.enabled)?.length ?? 0;
        price += prices.extras * amountOfEnabledExtras;
      } else {
        price += prices[upgrade] ?? 0;
      }
    }
    return price;
  };

  public getCosmetic = async (vin: string): Promise<Vehicles.Upgrades.Cosmetic.Upgrades> => {
    const baseUpgrades = generateBaseCosmeticUpgrades();
    const dbUpgrades = await getVehicleCosmeticUpgrades(vin);
    return mergeUpgrades<Vehicles.Upgrades.Cosmetic.Upgrades>(baseUpgrades, dbUpgrades ?? {});
  };

  public getPerformance = async (vin: string): Promise<Vehicles.Upgrades.Performance.Upgrades> => {
    const upgrades = generateBasePerformanceUpgrades();

    const vehicleClass = await getClassOfVehicleWithVin(vin);
    if (!vehicleClass) {
      this.logger.warn(`Tried to get performance upgrades of vehicle with unknown class: ${vin}`);
      return upgrades;
    }

    const items = await Inventory.getItemsInInventory<{ class: CarClass; stage: number }>('tunes', vin);
    for (const item of items) {
      if (item.metadata?.class !== vehicleClass) continue;

      // stage 1 translates to 0 for native status
      const stage = +(item.metadata.stage ?? 0) - 1;

      for (const [part, data] of Object.entries(TUNE_PARTS)) {
        if (data.itemName !== item.name) continue;

        if (data.amount === 1) {
          upgrades[part as Extract<Vehicles.Upgrades.Tune, 'turbo'>] = true;
        } else {
          if (upgrades[part as Exclude<Vehicles.Upgrades.Tune, 'turbo'>] < stage) {
            upgrades[part as Exclude<Vehicles.Upgrades.Tune, 'turbo'>] = stage;
          }
        }
      }
    }

    return upgrades;
  };

  public getFull = async (vin: string): Promise<Vehicles.Upgrades.Upgrades | undefined> => {
    const [cosmetic, performance] = await Promise.all([this.getCosmetic(vin), this.getPerformance(vin)]);
    return { ...cosmetic, ...performance };
  };

  public apply = (vehicle: number, upgrades: Partial<Vehicles.Upgrades.Upgrades>) => {
    Sync.executeAction('vehicles:upgrades:apply', vehicle, upgrades);
  };

  public doesModelHaveDefaultExtras = (model: string | number): boolean => {
    const modelConfig = getConfigByModel(model);
    if (!modelConfig) return false;
    if (modelConfig.type !== 'land') return true;
    return STANDARD_EXTRA_UPGRADES.includes(modelConfig.category);
  };
}

const upgradesManager = UpgradesManager.getInstance();
export default upgradesManager;
