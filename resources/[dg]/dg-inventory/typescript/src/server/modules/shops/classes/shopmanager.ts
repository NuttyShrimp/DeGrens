import { Config, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { concatId } from '../../../util';
import winston from 'winston';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';

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
    Object.entries(config.types).forEach(([type, items]) => {
      const allItems: Shops.Item[] = [];
      items.forEach(item => {
        const requiredItems: { name: string; label: string }[] = [];
        if (item.requirements.items) {
          item.requirements.items.forEach(reqItemName =>
            requiredItems.push({ name: reqItemName, label: itemDataManager.get(reqItemName).label })
          );
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
