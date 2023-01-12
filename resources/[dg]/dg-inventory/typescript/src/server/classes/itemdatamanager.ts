import { Config, Events } from '@dgx/server';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

@ExportRegister()
@RPCRegister()
class ItemDataManager extends Util.Singleton<ItemDataManager>() {
  private readonly logger: winston.Logger;
  private readonly itemData: Map<string, Inventory.ItemData>;
  private loaded: boolean;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'ItemDataManager' });
    this.itemData = new Map();
    this.loaded = false;
  }

  @Export('isItemDataLoaded')
  private _getIsLoaded = () => this.loaded;

  public seed = async () => {
    await Config.awaitConfigLoad();
    const data = Config.getConfigValue<Inventory.ItemData[]>('inventory.items');
    this.itemData.clear();
    data.forEach(i => {
      if (this.itemData.has(i.name)) {
        this.logger.warn(`Duplicate name '${i.name}' found in itemdata`);
        return;
      }
      this.itemData.set(i.name, i);
    });
    this.logger.info('Itemdata has been loaded');
    this.loaded = true;
  };

  @Export('getItemData')
  public get = (name: string) => {
    const item = this.itemData.get(name);
    if (!item) {
      throw new Error(`Could not get itemdata with nonexistent name ${name}`);
    }
    return item;
  };

  public doesItemNameExist = (name: string) => {
    return this.itemData.has(name);
  };

  @Export('getAllItemData')
  @RPCEvent('inventory:server:getAllItemData')
  private _getAll = () => {
    return Object.fromEntries(this.itemData);
  };

  // yes i like doing this using date.now because i cant be bothered to use actual dates and math is easier
  public getDestroyDate = (itemName: string, quality: number) => {
    const decayRate = this.get(itemName).decayRate; // amount of minutes to decay 100 quality
    if (!decayRate) return null;

    const currentMinutes = Math.floor(Date.now() / (1000 * 60));
    return currentMinutes + decayRate * (quality / 100) + 1440;
  };
}

const itemDataManager = ItemDataManager.getInstance();
export default itemDataManager;
