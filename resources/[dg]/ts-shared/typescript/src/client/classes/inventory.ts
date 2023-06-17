import { Events, RPC } from './index';

class Inventory {
  public getItemData = (itemName: string): Inventory.ItemData | undefined =>
    global.exports['dg-inventory'].getItemData(itemName);

  public getAllItemData = (): Inventory.ItemData => global.exports['dg-inventory'].getAllItemData();

  public hasObject = (): boolean => global.exports['dg-inventory'].hasObject();

  public openStash = (stashId: string, size?: number): void =>
    global.exports['dg-inventory'].open({ type: 'stash', identifier: stashId, data: size });

  public openShop = (shopId: string): void => global.exports['dg-inventory'].open({ type: 'shop', identifier: shopId });

  public openTunes = (vin: string) => {
    global.exports['dg-inventory'].open({ type: 'tunes', identifier: vin });
  };

  public openBench = (benchId: string) => {
    global.exports['dg-inventory'].open({ type: 'bench', identifier: benchId });
  };

  public doesPlayerHaveItems = async (name: string | string[]) => {
    return !!(await RPC.execute<boolean>('inventory:server:doesPlayerHaveItems', name));
  };

  public removeItemByNameFromPlayer = async (name: string, amount?: number): Promise<boolean> => {
    return !!(await RPC.execute<boolean>('inventory:server:removeItemByNameFromPlayer', name, amount));
  };

  public removeItemById = async (itemId: string): Promise<boolean> => {
    return !!(await RPC.execute<boolean>('inventory:server:removeItemById', itemId));
  };

  /**
   * Only use to do first check in things like peek, radialmenu where you dont want to call server every time
   * Make sure to use proper server check when doing action
   */
  public getCachedItemNames = (): string[] => {
    return global.exports['dg-inventory'].getCachedItemNames();
  };

  public toggleObject = (itemId: string, toggle: boolean) => {
    Events.emitNet('inventory:objects:toggle', itemId, toggle);
  };

  public toggleAllObjects = (toggle: boolean) => {
    Events.emitNet('inventory:objects:toggleAll', toggle);
  };

  public isOpen = () => {
    return global.exports['dg-inventory'].isOpen();
  };

  public close = () => {
    global.exports['dg-inventory'].close();
  };
}

export default {
  Inventory: new Inventory(),
};
