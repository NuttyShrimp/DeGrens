import { Config, Events } from '@dgx/server';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

@ExportRegister()
@RPCRegister()
class ItemDataManager extends Util.Singleton<ItemDataManager>() {
  private logger: winston.Logger;
  private itemData: Record<string, Inventory.ItemData>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'ItemDataManager' });
    this.itemData = {};
  }

  public seed = async () => {
    await Config.awaitConfigLoad();
    const data = Config.getConfigValue<Inventory.ItemData[]>('inventory.items');
    this.itemData = {};
    data.forEach(i => {
      if (this.itemData[i.name]) {
        this.logger.warn(`Duplicate name '${i.name}' found in itemdata`);
        return;
      }
      this.itemData[i.name] = i;
    });
    Events.emitNet('inventory:client:updateAllItemData', -1, this.itemData);
    this.logger.info('Itemdata has been (re)loaded');
  };

  @Export('getItemData')
  public get = (name: string) => {
    const item = this.itemData[name];
    if (!item) {
      this.logger.error(`Tried to get itemdata of unregistered item ${name}`);
      throw new Error();
    }
    return item;
  };

  @Export('getAllItemData')
  @RPCEvent('inventory:server:getAllItemData')
  private _getAll = async () => {
    return this.itemData;
  };
}

const itemDataManager = ItemDataManager.getInstance();
export default itemDataManager;
