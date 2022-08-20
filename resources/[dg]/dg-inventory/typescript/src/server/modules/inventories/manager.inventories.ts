import { Util } from '@dgx/server';
import { EventListener } from '@dgx/server/decorators';
import itemManager from 'modules/items/manager.items';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { Inv } from './classes/inv';

@EventListener()
class InventoryManager extends Util.Singleton<InventoryManager>() {
  private readonly logger: winston.Logger;
  private readonly inventories: Map<string, Inv>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'InventoryManager' });
    this.logger.info('Loaded');
    this.inventories = new Map();
  }

  public get = async (invId: string) => {
    let inventory = this.inventories.get(invId);
    if (!inventory) {
      inventory = new Inv();
      this.inventories.set(invId, inventory);
      await inventory.init(invId);
    }
    return inventory;
  };

  public save = async (invId: string) => {
    const inventory = await this.get(invId);
    inventory.save();
  };

  // Remove an inventory, only used with location based inventories if no items are inside and removing drops
  public remove = (invId: string) => {
    this.inventories.delete(invId);
  };

  // Unload inv, gets used when player leaves. This way, when he reconnects objects will spawn on player
  public unload = async (invId: string) => {
    const inventory = this.get(invId);
    const itemIds = (await inventory).getItems().map(i => i.id);
    itemIds.forEach(id => itemManager.unloadItem(id));
    this.inventories.delete(invId);
  };
}

const inventoryManager = InventoryManager.getInstance();
export default inventoryManager;
