import { Util } from '@dgx/client';
import { Export, ExportRegister } from '@dgx/shared/decorators';

@ExportRegister()
class ItemDataManager extends Util.Singleton<ItemDataManager>() {
  public itemData: Record<string, Inventory.ItemData> = {};

  public seed = (itemData: typeof this.itemData) => {
    this.itemData = itemData;
  };

  @Export('getItemData')
  public get = (name: string) => {
    const item = this.itemData[name];
    if (!item) {
      throw new Error(`Could not get itemdata with nonexistent name ${name}`);
    }
    return item;
  };

  @Export('getAllItemData')
  public getAll = () => this.itemData;
}

const itemDataManager = ItemDataManager.getInstance();
export default itemDataManager;
