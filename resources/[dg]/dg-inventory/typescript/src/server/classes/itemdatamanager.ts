import { Config, Events, ExportDecorators, Util } from '@dgx/server';
import { RPCRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

const { Export, ExportRegister } = ExportDecorators<'inventory'>();

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
  private _getIsLoaded() {
    return this.loaded;
  }

  public seed = () => {
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
  public get(name: string) {
    const item = this.itemData.get(name);
    if (!item) {
      throw new Error(`Could not get itemdata with nonexistent name ${name}`);
    }
    return item;
  }

  public doesItemNameExist = (name: string) => {
    return this.itemData.has(name);
  };

  @Export('getAllItemData')
  private getAll() {
    return Object.fromEntries(this.itemData);
  }

  public seedItemDataForPlayer = (plyId: number) => {
    Events.emitNet('inventory:itemdata:seed', plyId, this.getAll());
  };

  public getInitialDestroyDate = (itemName: string) => {
    const decayRate = this.get(itemName).decayRate; // amount of minutes to decay 100 quality
    if (!decayRate) return null;

    const nowUnix = Math.floor(Date.now() / 1000);
    return Math.round(nowUnix + Math.round(decayRate * 60));
  };

  public getModifiedDestroyDate = (itemName: string, destroyDate: number, qualityModifier: number) => {
    const decayRate = this.get(itemName).decayRate; // amount of minutes to decay 100 quality
    if (!decayRate) return null;

    const modifyRate = decayRate * (qualityModifier / 100);

    return Math.round(destroyDate + modifyRate * 60);
  };

  public getItemQuality = (itemName: string, destroyDate: number | null): number => {
    const decayRate = this.get(itemName).decayRate; // amount of minutes to decay 100 quality
    if (!decayRate || !destroyDate) return 100;

    const secDecayRate = 1 / Math.round(decayRate * 60);
    const timeToExist = destroyDate - Math.round(Date.now() / 1000);
    return Number((timeToExist * secDecayRate * 100).toFixed(4));
  };
}

const itemDataManager = ItemDataManager.getInstance();
export default itemDataManager;
