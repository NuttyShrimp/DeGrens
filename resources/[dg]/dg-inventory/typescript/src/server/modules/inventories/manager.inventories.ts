import { ExportDecorators, Util } from '@dgx/server';
import itemManager from 'modules/items/manager.items';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import { Inv } from './classes/inv';

const { Export, ExportRegister } = ExportDecorators<'inventory'>();

@ExportRegister()
class InventoryManager extends Util.Singleton<InventoryManager>() {
  private readonly logger: winston.Logger;
  private readonly inventories: Map<string, Inv>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'InventoryManager' });
    this.logger.info('Loaded');
    this.inventories = new Map();
  }

  public get = async (invId: string, checkIfLoaded = true) => {
    let inventory = this.inventories.get(invId);
    if (!inventory) {
      inventory = new Inv();
      this.inventories.set(invId, inventory);
      await inventory.init(invId);
    }

    // This is needed when simultaneously calling this func for same inventoryId
    // First call will load and instanlty register in this.inventories and then load the items.
    // The second simultaneous call will see the inv with id in this.inventories but items wont be loaded yet
    if (checkIfLoaded) {
      while (!inventory.isLoaded) {
        await Util.Delay(1);
      }
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
  @Export('forceUnloadInventory')
  public async unload(invId: string) {
    const inventory = await this.get(invId);
    inventory.getItems(true).forEach(item => itemManager.unloadItem(item.state.id));
    this.inventories.delete(invId);
  }
}

const inventoryManager = InventoryManager.getInstance();
export default inventoryManager;
