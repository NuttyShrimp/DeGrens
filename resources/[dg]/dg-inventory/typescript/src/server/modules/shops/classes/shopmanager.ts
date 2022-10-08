import { Config, Financials, Util } from '@dgx/server';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import { concatId } from '../../../util';

class ShopManager extends Util.Singleton<ShopManager>() {
  private readonly logger: winston.Logger;
  private readonly shops: Map<string, Shops.Shop>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'ShopManager' });
    this.shops = new Map();
  }

  public seed = async () => {
    await Config.awaitConfigLoad();
    const config = Config.getConfigValue<Shops.Config>('inventory.shops');
    const types: { [key: string]: Shops.Item[] } = {};

    // Resource gets started before financials so wait till taxes loaded before continuing
    const taxId = 6;
    await Util.awaitCondition(() => Financials.getTaxInfo(taxId) !== undefined);

    Object.entries(config.types).forEach(([type, items]) => {
      const allItems: Shops.Item[] = [];
      items.forEach(item => {
        const requiredItems: { name: string; label: string }[] = [];
        if (item.requirements.items) {
          item.requirements.items.forEach(reqItemName =>
            requiredItems.push({ name: reqItemName, label: itemDataManager.get(reqItemName).label })
          );
        }
        if (item.requirements.cash) {
          item.requirements.cash = Financials.getTaxedPrice(item.requirements.cash, taxId).taxPrice;
        }
        const requirements = {
          cash: item.requirements.cash,
          items: requiredItems,
        };
        for (let i = 0; i < item.amount; i++) {
          allItems.push({ name: item.name, requirements: requirements });
        }
      });
      types[type] = allItems;
    });

    Object.entries(config.shops).forEach(([id, shop]) => {
      const items = types[shop.type];
      this.shops.set(concatId('shop', id), { items });
    });

    this.logger.info('All shops have been seeded');
  };

  public getItems = (id: string) => {
    return this.shops.get(id)?.items ?? [];
  };
}

const shopManager = ShopManager.getInstance();
export default shopManager;
