import { RPC } from './index';

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

  public doesPlayerHaveItems = async (name: string | string[]) => {
    return !!(await RPC.execute<boolean>('inventory:server:doesPlayerHaveItems', name));
  };

  public removeItemFromPlayer = async (name: string): Promise<boolean> => {
    return !!(await RPC.execute<boolean>('inventory:server:removeItemFromPlayer', name));
  };

  public toggleObject = (itemId: string, toggle: boolean) => {
    global.exports['dg-inventory'].toggleObject(itemId, toggle);
  };

  public isOpen = () => {
    return global.exports['dg-inventory'].isOpen();
  };
}

export default {
  Inventory: new Inventory(),
};
