import { Events, RPC } from './index';

class Inventory {
  public getItemData = (itemName: string): Inventory.ItemData | undefined =>
    global.exports['dg-inventory'].getItemData(itemName);

  public getAllItemData = (): Inventory.ItemData => global.exports['dg-inventory'].getAllItemData();

  public hasObject = (): boolean => global.exports['dg-inventory'].hasObject();

  public openStash = (stashId: string, size?: number): void =>
    global.exports['dg-inventory'].open({ type: 'stash', identifier: stashId, data: size });

  public openOtherPlayer = (plyId: number): void =>
    global.exports['dg-inventory'].open({ type: 'player', data: plyId });

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

  public removeItemFromPlayer = async (name: string): Promise<boolean> => {
    return !!(await RPC.execute<boolean>('inventory:server:removeItemFromPlayer', name));
  };

  public getAllItemNames = () => {
    return global.exports['dg-inventory'].getAllItemNames();
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
