import { Config, Financials, Util } from '@dgx/server';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

class ShopManager extends Util.Singleton<ShopManager>() {
  private readonly logger: winston.Logger;
  private readonly shops: Map<string, Shops.Item[]>;

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

    // Generate items per type
    Object.entries(config.types).forEach(([type, items]) => {
      types[type] = items.map(i => {
        const info = itemDataManager.get(i.name);
        return {
          ...i,
          label: info.label,
          image: info.image,
          size: info.size,
          requirements: {
            cash: Financials.getTaxedPrice(i.price, taxId).taxPrice,
          },
        };
      });
    });

    // Assign items to shop according to its type
    Object.entries(config.shops).forEach(([id, shop]) => {
      this.shops.set(id, [...types[shop.type]]);
    });

    this.logger.info('All shops have been seeded');
  };

  public getItems = (id: string) => {
    return this.shops.get(id) ?? [];
  };

  public decreaseItem = (id: string, name: string) => {
    const items = this.shops.get(id) ?? [];
    const item = items.find(i => i.name === name);
    if (!item) return;
    this.shops.set(id, [...items.filter(i => i.name !== name), { ...item, amount: item.amount - 1 }]);
  };
}

const shopManager = ShopManager.getInstance();
export default shopManager;
